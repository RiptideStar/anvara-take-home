import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma, CampaignStatus } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth, requireSponsor } from '../auth.js';

const router: IRouter = Router();

// GET /api/campaigns - List the authenticated sponsor's campaigns
router.get('/', requireAuth, requireSponsor, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const campaigns = await prisma.campaign.findMany({
      where: {
        sponsorId: req.user!.sponsorId,
        ...(status && { status: status as string as 'ACTIVE' | 'PAUSED' | 'COMPLETED' }),
      },
      include: {
        sponsor: { select: { id: true, name: true, logo: true } },
        _count: { select: { creatives: true, placements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/campaigns/:id - Get single owned campaign with details
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    // Scope by owner: a non-owned or non-existent id both yield 404, so we
    // never reveal whether another sponsor's campaign exists.
    const campaign = await prisma.campaign.findFirst({
      where: { id, sponsor: { userId: req.user!.id } },
      include: {
        sponsor: true,
        creatives: true,
        placements: {
          include: {
            adSlot: true,
            publisher: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST /api/campaigns - Create a campaign for the authenticated sponsor
router.post('/', requireAuth, requireSponsor, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      budget,
      cpmRate,
      cpcRate,
      startDate,
      endDate,
      targetCategories,
      targetRegions,
    } = req.body;

    if (!name || !budget || !startDate || !endDate) {
      res.status(400).json({
        error: 'Name, budget, startDate, and endDate are required',
      });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetCategories: targetCategories || [],
        targetRegions: targetRegions || [],
        // Ownership comes from the session, never the client payload.
        sponsorId: req.user!.sponsorId!,
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PUT /api/campaigns/:id - Update an owned campaign
router.put('/:id', requireAuth, requireSponsor, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    // Ownership check: not-owned and non-existent both yield 404.
    const existing = await prisma.campaign.findFirst({
      where: { id, sponsor: { userId: req.user!.id } },
      select: { id: true },
    });
    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const { name, description, budget, cpmRate, cpcRate, startDate, endDate, status } = req.body;

    // Validate provided fields.
    if (budget !== undefined && (!Number.isFinite(Number(budget)) || Number(budget) <= 0)) {
      res.status(400).json({ error: 'budget must be a positive number' });
      return;
    }
    if (startDate !== undefined && Number.isNaN(new Date(startDate).getTime())) {
      res.status(400).json({ error: 'startDate is invalid' });
      return;
    }
    if (endDate !== undefined && Number.isNaN(new Date(endDate).getTime())) {
      res.status(400).json({ error: 'endDate is invalid' });
      return;
    }
    if (status !== undefined && !Object.values(CampaignStatus).includes(status)) {
      res.status(400).json({ error: 'status is not a valid campaign status' });
      return;
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(budget !== undefined && { budget: Number(budget) }),
        ...(cpmRate !== undefined && { cpmRate }),
        ...(cpcRate !== undefined && { cpcRate }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(status !== undefined && { status }),
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /api/campaigns/:id - Delete an owned campaign
router.delete('/:id', requireAuth, requireSponsor, async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);

    const existing = await prisma.campaign.findFirst({
      where: { id, sponsor: { userId: req.user!.id } },
      select: { id: true },
    });
    if (!existing) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    await prisma.campaign.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;
