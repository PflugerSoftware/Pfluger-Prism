# Project Prism - Cost Estimation System

**Status**: Active Development
**Approach**: Space-based elemental cost aggregation with manual calibration
**Project**: Liberty Hill ISD Bond Planning Tool

---

## System Overview

Project Prism uses a **bottom-up cost estimation approach** where individual educational spaces have embedded elemental cost characteristics that aggregate into project-level Uniformat breakdowns.

### Core Workflow

```
SPACE → POD → PROJECT → ELEMENTAL COSTS
```

**How it works:**
1. User selects spaces (classrooms, labs, gyms, etc.) or pre-built pods
2. Each space has a cost/SF and elemental breakdown percentages
3. Space costs aggregate to pod costs
4. Pod costs aggregate to project base construction cost
5. Elemental costs derive from space-level percentages
6. Soft costs (site, design, contingency) calculate from base cost

---

## Database Architecture

### 1. Space Types Table
```sql
space_types
├── id
├── name (e.g., "Standard Classroom", "Wet Science Lab")
├── category
├── cost_per_sf         ← Estimator provides
├── default_sf
└── description
```

### 2. Space Elemental Costs Table
**This is the engine that drives everything.**

```sql
space_elemental_costs
├── space_type_id       (links to space_types)
├── element_code        (A2, A3, B1, B2, C1, C2, D1, etc.)
├── element_name        (Structure, Enclosure, Mechanical, Electrical, etc.)
├── percentage          ← Estimator provides (decimal: 0.25 = 25%)
└── notes
```

**Uniformat Element Categories:**
- **A1** - Substructure (foundations, slab)
- **A2** - Superstructure (framing, roof structure)
- **A3** - Exterior Enclosure (walls, windows, roofing)
- **B1** - Interior Partitions (interior walls)
- **B2** - Interior Finishes (flooring, ceiling, paint)
- **C1** - HVAC (mechanical systems)
- **C2** - Electrical (lighting, power, low voltage)
- **D1** - Equipment & Furnishings (casework, fixtures)

---

## Space Elemental Cost Examples

### Example 1: Black Box Theater @ $425/SF

| space_type_id | element_code | element_name | percentage | notes | $/SF |
|---------------|--------------|--------------|------------|-------|------|
| 8 | A2 | Superstructure | 0.22 | Structure/framing/catwalks | $93.50 |
| 8 | A3 | Exterior Enclosure | 0.12 | Walls/acoustics | $51.00 |
| 8 | B1 | Interior Partitions | 0.08 | Minimal interior walls | $34.00 |
| 8 | B2 | Interior Finishes | 0.15 | Flooring/wall treatment/acoustics | $63.75 |
| 8 | C1 | HVAC | 0.18 | Theatrical HVAC/quiet systems | $76.50 |
| 8 | C2 | Electrical | 0.20 | Stage lighting/sound/power | $85.00 |
| 8 | D1 | Equipment | 0.05 | Rigging/curtains/seating | $21.25 |
| | | **TOTAL** | **1.00** | | **$425.00** |

### Example 2: Storage Closet @ $120/SF

| space_type_id | element_code | element_name | percentage | notes | $/SF |
|---------------|--------------|--------------|------------|-------|------|
| 15 | A2 | Superstructure | 0.30 | Structure/framing | $36.00 |
| 15 | A3 | Exterior Enclosure | 0.05 | Minimal exterior walls | $6.00 |
| 15 | B1 | Interior Partitions | 0.15 | Interior walls | $18.00 |
| 15 | B2 | Interior Finishes | 0.08 | Basic finishes | $9.60 |
| 15 | C1 | HVAC | 0.10 | Minimal mechanical | $12.00 |
| 15 | C2 | Electrical | 0.07 | Basic lighting/power | $8.40 |
| 15 | D1 | Equipment | 0.25 | Shelving systems | $30.00 |
| | | **TOTAL** | **1.00** | | **$120.00** |

**Why the difference?**
- Theater needs specialized electrical (20% vs 7%) for lighting/sound systems
- Storage needs equipment/shelving (25%), theater needs theatrical equipment (5%)
- Theater is much more expensive overall ($425/SF vs $120/SF)
- Same elemental categories, completely different distributions

---

## Aggregation Example: Performing Arts Pod

**Pod = 1 Black Box Theater + 3 Storage Closets**

### Space Costs
| Space | Quantity | SF Each | Total SF | Cost/SF | Total Cost |
|-------|----------|---------|----------|---------|------------|
| Black Box Theater | 1 | 3,500 | 3,500 | $425 | $1,487,500 |
| Storage Closet | 3 | 500 | 1,500 | $120 | $180,000 |
| **POD TOTAL** | | | **5,000 SF** | | **$1,667,500** |

**Pod Average Cost: $334/SF** (weighted average)

### Pod Elemental Breakdown
**How we calculate:**
Each element cost = Sum of (Space Total Cost × Space Element Percentage) for all spaces

```
A2 Superstructure:    ($1,487.5K × 22%) + ($180K × 30%) = $381,250
C2 Electrical:        ($1,487.5K × 20%) + ($180K × 7%)  = $310,100
C1 HVAC:              ($1,487.5K × 18%) + ($180K × 10%) = $285,750
B2 Finishes:          ($1,487.5K × 15%) + ($180K × 8%)  = $237,525
A3 Enclosure:         ($1,487.5K × 12%) + ($180K × 5%)  = $187,500
B1 Partitions:        ($1,487.5K × 8%)  + ($180K × 15%) = $146,000
D1 Equipment:         ($1,487.5K × 5%)  + ($180K × 25%) = $119,375
────────────────────────────────────────────────────────────────
TOTAL:                                                    $1,667,500
```

**Key Insight:** Different space types have different elemental distributions. When you aggregate, you get a realistic blended breakdown that reflects the actual composition of the building.

---

## Full Project Calculation Example

### Project: Small Elementary School Addition

**User Selects:**
- 12× Standard Classroom (900 SF each @ $250/SF)
- 2× Wet Science Lab (1,200 SF each @ $425/SF)
- 1× Competition Gym (6,000 SF @ $185/SF)
- 1× Cafeteria (4,500 SF @ $220/SF)

### Step 1: Calculate Base Space Costs
```
12 classrooms:  10,800 SF × $250/SF = $2,700,000
2 labs:          2,400 SF × $425/SF = $1,020,000
1 gym:           6,000 SF × $185/SF = $1,110,000
1 cafeteria:     4,500 SF × $220/SF =   $990,000
─────────────────────────────────────────────────
Total Building SF: 23,700 SF
Base Construction: $5,820,000
Avg Cost/SF: $246/SF
```

### Step 2: Derive Elemental Costs
Using space-specific elemental percentages:

```
Example Element: A2 Superstructure
  Classrooms:  $2,700K × 25% = $675,000
  Labs:        $1,020K × 22% = $224,400
  Gym:         $1,110K × 35% = $388,500
  Cafeteria:     $990K × 28% = $277,200
  ─────────────────────────────────────
  Total A2:                   $1,565,100

Example Element: C1 HVAC
  Classrooms:  $2,700K × 20% = $540,000
  Labs:        $1,020K × 30% = $306,000  (higher - fume hoods)
  Gym:         $1,110K × 15% = $166,500
  Cafeteria:     $990K × 22% = $217,800  (kitchen exhaust)
  ─────────────────────────────────────
  Total C1:                   $1,230,300
```

**Full Elemental Breakdown:**
| Code | Element | Amount | % of Base |
|------|---------|--------|-----------|
| A2 | Superstructure | $1,565,100 | 26.9% |
| C1 | HVAC | $1,230,300 | 21.1% |
| A3 | Enclosure | $950,000 | 16.3% |
| B2 | Finishes | $890,000 | 15.3% |
| C2 | Electrical | $725,000 | 12.5% |
| B1 | Partitions | $515,000 | 8.8% |
| D1 | Equipment | $153,000 | 2.6% |
| **TOTAL** | | **$5,820,000** | **100%** |

### Step 3: Add Soft Costs
```
Base Construction:           $5,820,000
+ Site Development (12%):      $698,400
+ Design Fees (8%):            $521,664
+ Contingency (15%):           $873,000
─────────────────────────────────────────
Total Project Cost:          $7,913,064
Cost per SF:                 $334/SF
```

---

## Manual Calibration Approach

**Current Reality:** While the system can calculate costs from space data, we're currently **manually entering elemental costs at the building level**, interpolating from historical data guided by client discovery questions.

### Client Discovery Questions
These questions help estimators calibrate costs by understanding project priorities and constraints:

#### Values & Quality Expectations

**"How do you value high-performing building systems?"**
- Very important / Important / Somewhat important / Not a priority
- *Adjusts: LEED potential, mechanical %, finish quality*

**"What matters most for this project?"** (multi-select)
- □ Long-term operational savings
- □ Initial construction cost
- □ Speed of delivery
- □ Sustainability/environmental impact
- □ Durability and low maintenance
- *Adjusts: System selections, material quality, delivery method*

**"What's your philosophy on building quality?"**
- Premium / Above-average / Good value / Most cost-effective
- *Adjusts: Base $/SF multiplier (0.9× to 1.2×), finishes %*

**"How important is the 'wow factor' for this facility?"**
- Signature/flagship / Notable / Functional / Simple
- *Adjusts: Enclosure complexity, architectural features*

#### Risk & Schedule

**"How much certainty do you need in the cost estimate?"**
- Very tight control / Moderate flexibility / High flexibility
- *Adjusts: Contingency % (10% to 20%)*

**"What's driving your timeline?"**
- Specific move-in date / Bond election timing / General planning
- *Adjusts: Delivery method recommendation, schedule risk*

**"How concerned are you about future market escalation?"**
- Very concerned / Somewhat concerned / Not concerned
- *Adjusts: Escalation % (5% to 12%)*

#### Site & Context

**"What challenges do you expect with the site?"**
- Straightforward / Some issues / Significant constraints / Major challenges
- *Adjusts: Site cost multiplier (1.0× to 1.4×)*

**"Are there existing buildings or infrastructure to consider?"**
- New greenfield / Existing nearby / Partial demo / Major demo
- *Adjusts: Demo costs, phasing, potential hazmat/asbestos*

#### Non-Negotiables

**"What spaces are non-negotiable must-haves?"**
- Competition gym / Cafeteria / Library / Performing arts / Specialized labs / etc.
- *Guides pod selection, ensures priority spaces included*

**"Are there specific certifications you're pursuing?"**
- LEED (level) / CHIPS / Energy Star / None / Not sure
- *Adds: Certification costs, system upgrades*

---

## Project Parameters That Affect Costs

### Project Type
- **New Construction** - Ground-up facility
- **Renovations** - Modernize existing
- **Additions** - Expand existing
- **Equity Improvements** - Upgrades for parity

### Construction Type
- **Steel Frame** - Traditional structural steel
- **Concrete (Tilt-up)** - Pre-cast panels, economical
- **Mass Timber** - Sustainable, premium cost

### Building Height
- **1 Story** - Single level, maximum accessibility
- **2 Story** - Two levels, efficient land use
- **3+ Story** - High-density urban
- *Multi-story impacts: Elevators, stairs, higher structure %*

### Procurement Method
- **Competitive Sealed Proposal (CSP)** - Best value
- **Hard Bid (Design-Bid-Build)** - Traditional low-bid
- **Design-Build** - Single entity, faster
- **CMAR** - Construction Manager At-Risk, GMP

### Certifications
- **LEED** - Silver ($85K), Gold ($125K), Platinum ($165K)
- **CHIPS** - TX High-Performance Schools Program
- *Additive costs distributed across elemental categories*

---

## What Data We Need from Estimators

### 1. Space Type Costs (~40-60 educational spaces)
**For each space type:**
- Base cost per SF
- Typical square footage range
- Description/notes

**Examples:**
- Standard Classroom
- Science Lab (wet/dry)
- Gymnasium (competition/practice)
- Cafeteria/Kitchen
- Library/Media Center
- Administrative Offices
- Restrooms
- Specialty spaces (theater, music, etc.)

### 2. Elemental Breakdown Percentages
**For each space type, how does cost distribute across Uniformat?**

Must total to 100% per space type:
- A1 - Substructure
- A2 - Superstructure
- A3 - Exterior Enclosure
- B1 - Interior Partitions
- B2 - Interior Finishes
- C1 - HVAC
- C2 - Electrical
- D1 - Equipment/Furnishings

### 3. Soft Cost Percentages
- Site development (% of construction)
- Design fees (A&E %)
- Contingency (by project phase)
- FFE/Technology
- Permitting/fees

### 4. Adjustment Factors
- Geographic cost index (Liberty Hill, Austin, etc.)
- Site complexity multipliers
- Quality level multipliers
- Market condition factors

---

## Current Implementation Status

### ✅ Implemented
- Space types library (~40 space types)
- Pod-based space aggregation
- Pre-built pods (Performing Arts, STEM, Athletics, etc.)
- Custom pod builder
- Square footage tracking
- Project-level cost summation
- Manual elemental cost entry at project level

### 🔄 In Progress
- Space elemental cost percentages (database table created, data needed)
- Automatic elemental cost aggregation from spaces
- Historical project database for calibration

### ❌ Future Enhancements
- Real-time parametric recalculation
- Adjustment factors (site, location, quality)
- Automatic soft cost derivation
- Benchmark comparison
- What-if scenario analysis
- Cost escalation modeling

---

## Near-Term Deliverables

### By End of Year 2024
1. **Verm Cost Estimates**: Three schools (ES, MS, HS) at total cost level
   - Elementary School
   - Middle School (interpolated from ES and HS)
   - High School

2. **Historical Database**: ~80 projects from Verm's database
   - Pull sub-space cost data
   - Identify gaps for cost engine

3. **Question Development**: Pfluger + Verm collaborate
   - Questions to drive quantities
   - Questions to drive quality levels
   - Client discovery framework

4. **Construction Cost Deliverable**: Three schools with full breakdowns
   - Strategy: Use ES and HS to derive MS estimates

---

## Data Sources & Validation

### Primary Data Source
- **Verm Cost Database**: ~80 completed projects
- Historical Liberty Hill ISD projects
- Recent Texas K-12 bid results

### Validation Approach
1. Start with 5-10 key space types (proof-of-concept)
2. Validate against recent LHISD projects
3. Target accuracy: ±20% (conceptual phase)
4. Refine percentages based on actual results

### Ongoing Updates
- Quarterly cost data refresh
- Annual escalation rate updates
- Market condition adjustments
- Spot-check system-generated estimates

---

## Accuracy Expectations by Phase

| Phase | Accuracy Target | Use Case | Confidence |
|-------|----------------|----------|------------|
| Conceptual | ±20-25% | Long-range planning, initial bond sizing | Low-Medium |
| Schematic Design | ±15% | Bond program development, budget approval | Medium |
| Design Development | ±10% | Final bond amount, board presentations | Medium-High |
| Construction Docs | ±5-8% | Pre-bid validation | High |

**Note**: Project Prism is optimized for **conceptual through schematic phases** - bond planning, not final bidding.

---

## Benefits for District Managers

### Current Pain Points Solved
1. ✅ **Instant cost feedback** - No waiting for architects
2. ✅ **Transparent breakdowns** - See where money goes (Uniformat)
3. ✅ **Easy scenario testing** - "What if we add 2 classrooms?"
4. ✅ **Benchmark validation** - "Is this reasonable?"
5. ✅ **Bond planning accuracy** - Better budget confidence
6. ✅ **Educational value** - Learn space type costs

### Decision Support
- Compare renovation vs new construction
- Test different program mixes
- Evaluate quality level impacts
- Model phasing strategies
- Plan for future growth

---

## Methodology Questions for Estimators

### Key Question
**How should project parameters affect costs?**

**Option 1:** Modify base $/SF for each space type
- e.g., "Steel Classroom" = $250/SF, "Concrete Classroom" = $235/SF

**Option 2:** Apply as project-level multipliers
- e.g., all costs × 1.15 for mass timber

**Option 3:** Affect only certain elemental categories
- e.g., construction type only affects A2 Structure %

**Option 4:** Combination approach
- Some parameters modify space costs, others are multipliers

### Other Methodology Questions
1. Is space aggregation approach sound?
2. Should factors multiply or apply independently?
3. What are we missing?
4. How do renovation costs differ from new construction for same space?

---

## Document History

**Version**: 2.0 (Unified)
**Date**: 2024-11-17
**Status**: Active Development

**Sources Combined:**
- COST_ESTIMATING_DECISION.md (Decision framework)
- 251106-COST_ENGINE_CONCEPT_LITE.md (Meeting outline with examples)
- COST_ENGINE_CONCEPT.md (Theoretical design)

**Focus:** Current implementation approach - space elemental costs aggregating up, with manual calibration using historical data and client discovery questions.
