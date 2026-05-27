import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma, AdSlotType } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth, requirePublisher } from '../auth.js';

const router: IRouter = Router();

// GET /api/ad-slots - List available ad slots
router.get('/', async (req: Request, res: Response) => {
  try {
    const { publisherId, type, available } = req.query;

    const adSlots = await prisma.adSlot.findMany({
      where: {
        ...(publisherId && { publisherId: getParam(publisherId) }),
        ...(type && {
          type: type as string as 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'NEWSLETTER' | 'PODCAST',
        }),
        ...(available === 'true' && { isAvailable: true }),
      },
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
      orderBy: { basePrice: 'desc' },
    });

    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - Get single ad slot with details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    res.json(adSlot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({ error: 'Failed to fetch ad slot' });
  }
});

// POST /api/ad-slots - Create an ad slot for the authenticated publisher
router.post('/', requireAuth, requirePublisher, async (req: Request, res: Response) => {
  try {
    const { name, description, type, basePrice } = req.body;

    if (!name || !type || !basePrice) {
      res.status(400).json({
        error: 'Name, type, and basePrice are required',
      });
      return;
    }

    const adSlot = await prisma.adSlot.create({
      data: {
        name,
        description,
        type,
        basePrice,
        // Ownership comes from the session, never the client payload.
        publisherId: req.user!.publisherId!,
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(adSlot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// POST /api/ad-slots/:id/book - Book an ad slot (simplified booking flow)
// This marks the slot as unavailable and creates a simple booking record
router.post('/:id/book', async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const { sponsorId, message } = req.body;

    if (!sponsorId) {
      res.status(400).json({ error: 'sponsorId is required' });
      return;
    }

    // Check if slot exists and is available
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({ error: 'Ad slot is no longer available' });
      return;
    }

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    // In a real app, you'd create a Placement record here
    // For now, we just mark it as booked
    console.log(`Ad slot ${id} booked by sponsor ${sponsorId}. Message: ${message || 'None'}`);

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({ error: 'Failed to book ad slot' });
  }
});

// POST /api/ad-slots/:id/unbook - Reset ad slot to available (for testing)
router.post('/:id/unbook', async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({ error: 'Failed to unbook ad slot' });
  }
});

// PUT /api/ad-slots/:id - Update an owned ad slot
router.put('/:id', requireAuth, requirePublisher, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    // Ownership check: not-owned and non-existent both yield 404.
    const existing = await prisma.adSlot.findFirst({
      where: { id, publisher: { userId: req.user!.id } },
      select: { id: true },
    });
    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    const { name, description, type, basePrice, isAvailable } = req.body;

    // Validate provided fields.
    if (basePrice !== undefined && (!Number.isFinite(Number(basePrice)) || Number(basePrice) <= 0)) {
      res.status(400).json({ error: 'basePrice must be a positive number' });
      return;
    }
    if (type !== undefined && !Object.values(AdSlotType).includes(type)) {
      res.status(400).json({ error: 'type is not a valid ad slot type' });
      return;
    }
    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      res.status(400).json({ error: 'isAvailable must be a boolean' });
      return;
    }

    const adSlot = await prisma.adSlot.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json(adSlot);
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// DELETE /api/ad-slots/:id - Delete an owned ad slot
router.delete('/:id', requireAuth, requirePublisher, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const existing = await prisma.adSlot.findFirst({
      where: { id, publisher: { userId: req.user!.id } },
      select: { id: true },
    });
    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    await prisma.adSlot.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

export default router;
