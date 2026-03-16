from urllib import response

from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from dotenv import load_dotenv
from pathlib import Path
import os
load_dotenv(Path(__file__).parent / ".env")
print("HF TOKEN:", os.getenv("HF_API_KEY"))

import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from PyPDF2 import PdfReader
import io
import requests



ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'elastomer-secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24



# Create the main app
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

def generate_image(prompt):

    API_URL = "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5"

    headers = {
        "Authorization": f"Bearer {os.getenv('HF_API_KEY')}"
    }

    payload = {
        "inputs": prompt
    }

    response = requests.post(API_URL, headers=headers, json=payload)
    print("HF STATUS:", response.status_code)
    print("HF RESPONSE:", response.text[:500])
    if response.status_code != 200:
        print("HF ERROR:", response.text)
        return None

    if "image" not in response.headers.get("content-type", ""):
        print("HF ERROR:", response.text)
        return None

    image_bytes = response.content

    image_filename = f"generated_{hash(prompt)}.png"
    image_path = f"static/{image_filename}"

    with open(image_path, "wb") as f:
        f.write(image_bytes)

    return image_filename

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = "en"

class ChatResponse(BaseModel):
    response: str
    session_id: str

class FormulationRequest(BaseModel):
    hardness_shore_a: Optional[float] = None
    tensile_strength_mpa: Optional[float] = None
    elongation_percent: Optional[float] = None
    compression_set_percent: Optional[float] = None
    tear_strength_kn_m: Optional[float] = None
    abrasion_resistance: Optional[str] = None
    oil_resistance: Optional[str] = None
    heat_resistance_c: Optional[float] = None
    ozone_resistance: Optional[str] = None
    elastomer_type: Optional[str] = None
    application: Optional[str] = None
    additional_requirements: Optional[str] = None

class KnowledgeEntry(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str] = []

class ChatHistoryResponse(BaseModel):
    id: str
    session_id: str
    title: str
    messages: List[dict]
    created_at: str
    updated_at: str

class TrainingExample(BaseModel):
    prompt: str
    completion: str
    category: str = "general"
    tags: List[str] = []

class TrainingDataExport(BaseModel):
    format: str = "jsonl"  # jsonl for OpenAI fine-tuning

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== COMPREHENSIVE ELASTOMER KNOWLEDGE BASE ====================

ELASTOMER_SYSTEM_PROMPT = """You are ElastoAI, the world's most advanced AI assistant specialized in elastomer science, rubber formulation, and polymer chemistry. You have encyclopedic knowledge equivalent to decades of rubber industry experience.
Always structure answers using:

- headings
- bullet points
- tables when comparing materials
- short paragraphs

Avoid large unstructured text blocks.

When possible include examples.

End responses with 2 related follow-up questions.

## 1. ELASTOMER TYPES - DETAILED PROPERTIES

### Natural Rubber (NR) - Polyisoprene
- **Chemical Structure**: cis-1,4-polyisoprene from Hevea brasiliensis
- **Mooney Viscosity**: ML(1+4) at 100°C: 50-100 typical
- **Properties**: Tensile 25-30 MPa, Elongation 600-800%, Hardness range 30-90 Shore A
- **Temperature Range**: -55°C to +70°C continuous, +100°C short term
- **Strengths**: Excellent tensile, tear, abrasion, elasticity, low heat buildup, good tack
- **Weaknesses**: Poor ozone/oxygen resistance, swells in oils/solvents, degrades in UV
- **Applications**: Tires, conveyor belts, shock mounts, seals (non-oil), rubber bands
- **Cure Systems**: Sulfur (conventional, EV, semi-EV), peroxide for improved heat resistance

### Styrene-Butadiene Rubber (SBR)
- **Types**: E-SBR (emulsion, 23.5% styrene), S-SBR (solution, variable styrene)
- **Properties**: Tensile 10-25 MPa, Elongation 400-600%, similar to NR but lower
- **Temperature Range**: -50°C to +100°C
- **Strengths**: Good abrasion, aging stability, lower cost than NR, consistent quality
- **Weaknesses**: Lower tensile/tear than NR, poor oil resistance, higher heat buildup
- **Applications**: Tire treads, footwear, conveyor belts, automotive parts
- **Blending**: Often blended with NR (60/40 or 70/30) for balanced properties

### Nitrile Rubber (NBR) - Acrylonitrile-Butadiene
- **ACN Content**: Low (18-22%), Medium (28-34%), High (38-50%)
- **Properties by ACN**: Higher ACN = better oil resistance, lower flexibility
- **Temperature Range**: -40°C to +120°C (HNBR to +150°C)
- **Oil Resistance**: ASTM IRM 903 - Volume swell <25% for high ACN
- **Strengths**: Excellent fuel/oil/grease resistance, good abrasion, moderate cost
- **Weaknesses**: Poor ozone resistance (use HNBR), limited low-temp flexibility
- **Applications**: O-rings, fuel hoses, gaskets, oil seals, hydraulic seals
- **Special Grades**: HNBR (hydrogenated) for automotive timing belts, oil field

### EPDM - Ethylene Propylene Diene Monomer
- **Composition**: E/P ratio 45/55 to 75/25, diene (ENB, DCPD, HD) 2-12%
- **Properties**: Tensile 7-21 MPa, Elongation 100-600%, excellent weather resistance
- **Temperature Range**: -50°C to +150°C continuous, +175°C intermittent
- **Strengths**: Outstanding ozone/UV/weather resistance, good heat aging, steam resistant
- **Weaknesses**: Poor oil/fuel resistance, difficult bonding, limited flame resistance
- **Applications**: Automotive weatherstrips, roofing membranes, radiator hoses, seals
- **Cure Systems**: Sulfur (faster, better compression set) or peroxide (heat resistance)

### Silicone Rubber (VMQ, PVMQ, FVMQ)
- **Types**: VMQ (general), PVMQ (low temp), FVMQ (fuel resistant), LSR (liquid)
- **Properties**: Tensile 5-10 MPa, Elongation 100-800%, very wide temp range
- **Temperature Range**: -60°C to +230°C (special grades -100°C to +300°C)
- **Strengths**: Extreme temp range, biocompatible, UV stable, non-toxic, flexible
- **Weaknesses**: Poor tear/abrasion, high cost, limited chemical resistance, low strength
- **Applications**: Medical devices, food contact, high-temp seals, electrical insulation
- **Cure Systems**: Peroxide (HTV), platinum-catalyzed addition (LSR), condensation

### Neoprene (CR) - Polychloroprene
- **Types**: W-type (sulfur-modified), G/GN/GW (non-sulfur), grades by crystallization rate
- **Properties**: Tensile 15-25 MPa, Elongation 300-600%, self-extinguishing
- **Temperature Range**: -40°C to +120°C
- **Strengths**: Good oil/fuel resistance, flame retardant, ozone resistant, weatherable
- **Weaknesses**: Crystallizes at low temp, moderate cost, limited chemical resistance
- **Applications**: Wetsuits, wire jackets, automotive belts, adhesives, gaskets
- **Special**: Good balance of properties - "jack of all trades" elastomer

### Butyl Rubber (IIR) & Halobutyls (CIIR, BIIR)
- **Composition**: Isobutylene + 0.5-3% isoprene
- **Properties**: Tensile 10-17 MPa, very low gas permeability, excellent damping
- **Temperature Range**: -45°C to +120°C
- **Strengths**: Outstanding gas barrier, vibration damping, ozone/weather resistant
- **Weaknesses**: Poor oil resistance, difficult processing, slow cure, limited adhesion
- **Applications**: Inner tubes, tire liners, pharmaceutical stoppers, vibration mounts
- **Halobutyls**: CIIR/BIIR for faster cure, better adhesion in tire innerliners

### Fluoroelastomers (FKM/Viton®, FFKM, FEPM)
- **Types**: FKM (general), FFKM (perfluoro - extreme), FEPM (TFE/propylene)
- **Fluorine Content**: 66-70% for standard, higher for more chemical resistance
- **Temperature Range**: -20°C to +250°C (FFKM to +325°C)
- **Strengths**: Extreme chemical/fuel/oil resistance, high temp, low permeability
- **Weaknesses**: Very high cost, poor low-temp flexibility, attacked by amines/ketones
- **Applications**: Aerospace seals, chemical processing, semiconductor, oil/gas
- **Special**: Required for biodiesel, aggressive automotive fluids

### Polyurethane Elastomers (AU, EU)
- **Types**: Polyester (AU) - better oil/abrasion, Polyether (EU) - better hydrolysis
- **Properties**: Tensile 20-50 MPa, Elongation 300-700%, exceptional hardness range
- **Hardness Range**: 10 Shore A to 75 Shore D
- **Strengths**: Outstanding abrasion/tear resistance, high load bearing, castable
- **Weaknesses**: Poor heat resistance (80°C max), hydrolysis (AU), costly
- **Applications**: Industrial wheels, mining screens, seals, bumpers, rollers

### Chlorosulfonated Polyethylene (CSM/Hypalon)
- **Properties**: Excellent ozone/weather resistance, good color stability
- **Temperature Range**: -40°C to +120°C
- **Applications**: Roofing, tank linings, wire insulation, white/colored goods

### Epichlorohydrin (ECO, CO, GECO)
- **Properties**: Good fuel/oil resistance with better low-temp than NBR
- **Temperature Range**: -40°C to +150°C
- **Applications**: Automotive fuel system components, diaphragms

## 2. VULCANIZATION SYSTEMS - DETAILED

### Sulfur Vulcanization
**Conventional System (high sulfur):**
- Sulfur: 2.0-3.5 phr
- Accelerator: 0.5-1.0 phr
- Properties: Excellent tensile, poor heat aging, high compression set
- Cross-links: Predominantly polysulfidic (Sx where x>2)

**Efficient Vulcanization (EV):**
- Sulfur: 0.3-0.8 phr
- Accelerator: 2.0-5.0 phr (sulfur donors like TMTD)
- Properties: Excellent heat aging, low compression set, lower tensile
- Cross-links: Predominantly monosulfidic (C-S-C)

**Semi-EV System (balanced):**
- Sulfur: 1.0-1.7 phr
- Accelerator: 1.0-2.5 phr
- Properties: Balance of tensile and heat aging
- Cross-links: Mixed mono/di/polysulfidic

**Common Accelerators:**
- MBTS (Mercaptobenzothiazole disulfide): Safe processing, medium speed
- CBS (N-cyclohexyl-2-benzothiazolesulfenamide): Delayed action, scorch safety
- TBBS (N-tert-butyl-2-benzothiazolesulfenamide): Long scorch, fast cure
- TMTD (Tetramethylthiuram disulfide): Ultra accelerator, sulfur donor
- DPG (Diphenylguanidine): Secondary accelerator for silica compounds
- ZDEC/ZDBC: Thiurams for fast cure, limited scorch safety

**Activators:**
- Zinc Oxide: 3-5 phr standard, activates sulfur cure
- Stearic Acid: 1-2 phr, solubilizes zinc, processing aid

### Peroxide Vulcanization
**Advantages:** Better heat aging, no sulfur bloom, good compression set
**Disadvantages:** Lower tensile, no reversion protection, oxygen sensitive

**Common Peroxides:**
- DCP (Dicumyl peroxide): 1-4 phr, general purpose, 170°C cure
- DBPH (2,5-Dimethyl-2,5-di(t-butylperoxy)hexane): Higher temp processing
- BIPB: Good scorch safety, high temp cure
- BPO (Benzoyl peroxide): Low temp cure, silicone rubber

**Coagents (improve crosslink efficiency):**
- TAIC (Triallyl isocyanurate): 0.5-3 phr, excellent for EPDM
- TAC (Triallyl cyanurate): General purpose coagent
- TMPTMA: Multifunctional methacrylate
- HVA-2 (N,N'-m-phenylene bismaleimide): Also scorch retarder

### Metal Oxide Cure (for CR, CSM, ECO)
- Zinc Oxide: 5 phr
- Magnesium Oxide: 4 phr (acid acceptor)
- ETU (Ethylene thiourea): 0.5-1 phr accelerator for CR

## 3. FILLERS - COMPREHENSIVE GUIDE

### Carbon Black - Reinforcing
**Particle Size Classification:**
- N110, N121 (SAF): 20-25 nm, highest reinforcement, tire treads
- N220, N231 (ISAF): 24-33 nm, excellent reinforcement, treads
- N330, N339 (HAF): 28-36 nm, good reinforcement/processing balance
- N550 (FEF): 40-48 nm, moderate reinforcement, carcass
- N660 (GPF): 49-60 nm, good processing, inner tubes
- N762, N774 (SRF): 70-96 nm, low reinforcement, low cost compounds
- N990 (MT): 250-350 nm, low structure, high loading

**Loading Guidelines:**
- High reinforcement: 40-60 phr N220-N330
- General purpose: 50-70 phr N550-N660
- Low cost/high loading: 80-150 phr N762-N990

### Silica - Reinforcing
**Types:**
- Precipitated silica: VN3, Ultrasil, Hi-Sil - reinforcing
- Fumed silica: Aerosil, Cab-O-Sil - thickening, HCR silicone
- Surface area: 50-250 m²/g (higher = more reinforcing)

**Silane Coupling Agents (essential for silica):**
- Si-69 (TESPT): Sulfur-functional, standard for tires, 8-10% on silica
- Si-75 (TESPD): Less odor than Si-69
- NXT: Low VOC alternative
- Silane improves: Bound rubber, abrasion, rolling resistance, wet grip

**Silica Loading:** 30-80 phr with appropriate silane

### Mineral Fillers - Non-reinforcing/Semi-reinforcing
**Calcium Carbonate (CaCO3):**
- Ground (GCC): 1-5 μm, extender, cost reduction
- Precipitated (PCC): 0.05-0.1 μm, semi-reinforcing
- Coated: Stearate-coated for better dispersion
- Loading: 50-200 phr for cost reduction

**Clay (Kaolin):**
- Calcined: Better reinforcement, electrical properties
- Hard clay: Higher modulus, stiffness
- Soft clay: Better processing

**Talc:** Platy structure, barrier properties, stiffness

**Barites (BaSO4):** High density filler, X-ray shielding

## 4. PLASTICIZERS & PROCESS AIDS

### Petroleum-Based Oils
**Paraffinic:** Low VGC, good low temp, compatible with EPDM, IIR
**Naphthenic:** Medium VGC, general purpose, good solvency
**Aromatic:** High VGC, best reinforcement, NR/SBR, carcinogenic concerns (use TDAE)

**Loading:** 5-40 phr depending on hardness target

### Synthetic Plasticizers
- DOS/DOA (Dioctyl sebacate/adipate): Low temp flexibility, NBR/CR
- DOP/DEHP (Dioctyl phthalate): General purpose, regulatory concerns
- DINP/DIDP: Phthalate alternatives
- Ester plasticizers: 5-30 phr for low temp improvement

### Process Aids
- Stearic acid: 1-2 phr, activator and lubricant
- Zinc stearate: Release agent, lubricant
- Factice: Vulcanized oil, extrusion smoothness
- Wax (microcrystalline, paraffin): Surface protection, ozone barrier
- Fatty acid esters: Internal lubricants, mold release

## 5. PROTECTIVE SYSTEMS - ANTIDEGRADANTS

### Antioxidants (heat/oxygen aging)
**Amines (staining):**
- TMQ (Polymerized 2,2,4-trimethyl-1,2-dihydroquinoline): 1-2 phr, excellent
- 6PPD (N-(1,3-dimethylbutyl)-N'-phenyl-p-phenylenediamine): Antiozonant too
- IPPD: Similar to 6PPD, lower volatility

**Phenolics (non-staining):**
- BHT (Butylated hydroxytoluene): 0.5-1 phr, light stabilizer too
- Irganox 1010, 1076: High MW phenolics, low migration
- Wingstay L: Styrenated phenol, good retention

### Antiozonants
- Waxes: 1-3 phr, bloom to surface, physical barrier
- 6PPD/IPPD: Chemical antiozonants, 2-4 phr
- HPPD: For light-colored compounds
- TMQ: Some antiozonant activity

### UV Stabilizers (for light-colored compounds)
- Carbon black: Best UV absorber (black only)
- TiO2: UV scatter in white compounds
- UV absorbers: Tinuvin, Chimassorb

## 6. PROCESSING PARAMETERS

### Mixing
**Internal Mixer (Banbury):**
- Fill factor: 0.65-0.75
- Rotor speed: 20-60 rpm
- Temperature control: 100-160°C dump temp
- Non-productive (masterbatch): polymers, fillers, oils, antidegradants
- Productive (final): curatives added below 100°C

**Two-Roll Mill:**
- Friction ratio: 1:1.1 to 1:1.4
- Nip width: Start wide, progressively narrow
- Band temp: 40-70°C for NR, 50-80°C for synthetics

### Cure Time Calculation
**t90 (90% cure):** Standard cure time from rheometer
**Cure time = t90 + 1-2 minutes** safety factor
**Temperature coefficient:** Time halves for every 10°C increase (roughly)

### Mold Temperature Guidelines
- NR: 140-160°C
- SBR: 150-170°C
- NBR: 150-180°C
- EPDM (sulfur): 160-180°C
- EPDM (peroxide): 170-200°C
- Silicone: 150-200°C
- FKM: 170-200°C

## 7. TYPICAL FORMULATION EXAMPLES (phr)

### General Purpose NR (70 Shore A)
- NR (SMR CV60): 100
- N330 Carbon Black: 50
- Naphthenic Oil: 5
- Zinc Oxide: 5
- Stearic Acid: 2
- 6PPD Antiozonant: 2
- TMQ Antioxidant: 1
- Sulfur: 2.5
- CBS Accelerator: 0.6

### Oil-Resistant NBR O-ring (70 Shore A)
- NBR (34% ACN): 100
- N550 Carbon Black: 40
- DOP Plasticizer: 10
- Zinc Oxide: 5
- Stearic Acid: 1
- TMQ: 1.5
- Sulfur: 1.5
- MBTS: 1.5
- TMTD: 0.3

### Heat-Resistant EPDM Seal (60 Shore A)
- EPDM (ENB 4.5%): 100
- N550 Carbon Black: 80
- Paraffinic Oil: 60
- Zinc Oxide: 5
- Stearic Acid: 1
- TMQ: 1.5
- Sulfur: 1.5
- MBTS: 0.75
- TMTD: 1.0
- ZDEC: 0.75

### High-Performance FKM (75 Shore A)
- FKM (66% F): 100
- MT Carbon Black: 20
- MgO: 3
- Ca(OH)2: 6
- Bisphenol AF/accelerator: 2-4

## 8. PROPERTY RELATIONSHIPS & GUIDELINES

### Hardness Adjustment
- +10 phr carbon black ≈ +5 Shore A
- +10 phr plasticizer ≈ -5 Shore A
- +10 phr mineral filler ≈ +2-3 Shore A

### Compression Set Improvement
- Use EV or peroxide cure
- Increase crosslink density
- Reduce filler loading
- Use heat-resistant polymer grades

### Tear Strength Improvement
- Use NR or CR base (strain crystallizing)
- Optimize filler dispersion
- Add reinforcing resins
- Increase crosslink density to optimum

### Oil Resistance Improvement
- Increase ACN content (NBR)
- Use FKM for severe service
- Add plasticizers compatible with fluids
- Consider HNBR for balanced properties

When predicting formulations:
1. Always provide specific phr values
2. Explain the function of each ingredient
3. Specify expected properties
4. Include processing recommendations
5. Warn about potential issues

Support multiple languages - respond in the same language as the user's query."""

BASE_CHAT_SYSTEM_PROMPT = """
You are an elastomer engineering assistant.

When explaining chemical compounds, polymers, or elastomer materials:

1. Include molecular structure diagrams when possible.
2. Use Markdown image format to show structures.
3. Use reliable scientific images from sources like Wikipedia or PubChem.

Example:

Natural Rubber Structure

![Polyisoprene Structure](https://upload.wikimedia.org/wikipedia/commons/6/6a/Polyisoprene.svg)

Then explain the structure.
"""


# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user.email,
        "name": user.name,
        "password": hash_password(user.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "email": user.email, "name": user.name}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"], "name": current_user["name"]}

# ==================== CHAT ENDPOINTS ====================
import time
@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    from elastoai_llm import LlmChat, UserMessage

    session_id = request.session_id or str(uuid.uuid4())

    chat_session = await db.chat_sessions.find_one(
        {"session_id": session_id, "user_id": current_user["id"]},
        {"_id": 0}
    )

    system_message = BASE_CHAT_SYSTEM_PROMPT
    if request.language and request.language != "en":
        system_message += f"\nReply in {request.language}."

    llm_chat = LlmChat(system_message=system_message)

    history = []
    if chat_session and chat_session.get("messages"):
        history = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in chat_session["messages"][-2:]
        ]

    user_message = UserMessage(text=request.message)
    response = await llm_chat.send_message(user_message, history=history)
    
    print("FULL RESPONSE LENGTH:", len(response))
    print("FULL RESPONSE END:", response[-500:])
    timestamp = datetime.now(timezone.utc).isoformat()
    user_msg = {"role": "user", "content": request.message, "timestamp": timestamp}
    assistant_msg = {"role": "assistant", "content": response, "timestamp": timestamp}

    if chat_session:
        await db.chat_sessions.update_one(
            {"session_id": session_id, "user_id": current_user["id"]},
            {
                "$push": {"messages": {"$each": [user_msg, assistant_msg]}},
                "$set": {"updated_at": timestamp}
            }
        )
    else:
        title = request.message[:50] + "..." if len(request.message) > 50 else request.message
        await db.chat_sessions.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": current_user["id"],
            "title": title,
            "messages": [user_msg, assistant_msg],
            "created_at": timestamp,
            "updated_at": timestamp
        })

    return ChatResponse(response=response, session_id=session_id)


# ==================== FORMULATION PREDICTION ====================

@api_router.post("/predict-formulation")
async def predict_formulation(request: FormulationRequest, current_user: dict = Depends(get_current_user)):
    from elastoai_llm import LlmChat, UserMessage
    
    # Build detailed prompt
    requirements = []
    if request.hardness_shore_a:
        requirements.append(f"- Hardness: {request.hardness_shore_a} Shore A")
    if request.tensile_strength_mpa:
        requirements.append(f"- Tensile Strength: {request.tensile_strength_mpa} MPa")
    if request.elongation_percent:
        requirements.append(f"- Elongation at Break: {request.elongation_percent}%")
    if request.compression_set_percent:
        requirements.append(f"- Compression Set: {request.compression_set_percent}%")
    if request.tear_strength_kn_m:
        requirements.append(f"- Tear Strength: {request.tear_strength_kn_m} kN/m")
    if request.abrasion_resistance:
        requirements.append(f"- Abrasion Resistance: {request.abrasion_resistance}")
    if request.oil_resistance:
        requirements.append(f"- Oil Resistance: {request.oil_resistance}")
    if request.heat_resistance_c:
        requirements.append(f"- Heat Resistance: up to {request.heat_resistance_c}°C")
    if request.ozone_resistance:
        requirements.append(f"- Ozone Resistance: {request.ozone_resistance}")
    if request.elastomer_type:
        requirements.append(f"- Preferred Elastomer Type: {request.elastomer_type}")
    if request.application:
        requirements.append(f"- Application: {request.application}")
    if request.additional_requirements:
        requirements.append(f"- Additional Requirements: {request.additional_requirements}")
    
    prompt = f"""Based on the following requirements, provide a detailed elastomer formulation recommendation:

**Target Properties:**
{chr(10).join(requirements)}

Please provide:
1. **Recommended Base Polymer(s)** with justification
2. **Complete Formulation** in phr (parts per hundred rubber):
   - Base polymer(s)
   - Vulcanization system
   - Fillers
   - Plasticizers
   - Protective agents
   - Processing aids
3. **Expected Properties** of the formulation
4. **Processing Recommendations** (mixing, curing conditions)
5. **Alternative Options** if applicable
6. **Potential Issues and Mitigations**"""

    llm_chat = LlmChat(
    system_message=ELASTOMER_SYSTEM_PROMPT
)
    response = await llm_chat.send_message(UserMessage(text=prompt))
    
    # Save prediction history
    await db.formulation_history.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "request": request.model_dump(),
        "response": response,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"formulation": response}

# ==================== CHAT HISTORY ====================

@api_router.get("/chat-history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    sessions = await db.chat_sessions.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("updated_at", -1).to_list(100)
    return sessions

@api_router.get("/chat-history/{session_id}")
async def get_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    session = await db.chat_sessions.find_one(
        {"session_id": session_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@api_router.delete("/chat-history/{session_id}")
async def delete_chat_session(session_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.chat_sessions.delete_one(
        {"session_id": session_id, "user_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}


    # ================= STRUCTURE IMAGE =================

    
# ==================== KNOWLEDGE BASE ====================

@api_router.post("/knowledge")
async def add_knowledge(entry: KnowledgeEntry, current_user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "title": entry.title,
        "content": entry.content,
        "category": entry.category,
        "tags": entry.tags,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.knowledge_base.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/knowledge")
async def get_knowledge(current_user: dict = Depends(get_current_user)):
    entries = await db.knowledge_base.find({}, {"_id": 0}).to_list(500)
    return entries

@api_router.delete("/knowledge/{entry_id}")
async def delete_knowledge(entry_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.knowledge_base.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Entry deleted"}

# ==================== DOCUMENT UPLOAD ====================

@api_router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("general"),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read PDF content
    content = await file.read()
    pdf_reader = PdfReader(io.BytesIO(content))
    
    text_content = ""
    for page in pdf_reader.pages:
        text_content += page.extract_text() + "\n"
    
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    # Store document
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "filename": file.filename,
        "content": text_content[:50000],  # Limit content size
        "category": category,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.documents.insert_one(doc)
    
    # Also add to knowledge base
    knowledge_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "title": f"Document: {file.filename}",
        "content": text_content[:20000],
        "category": category,
        "tags": ["uploaded", "document"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.knowledge_base.insert_one(knowledge_doc)
    
    return {"message": "Document uploaded and processed", "document_id": doc["id"]}

@api_router.get("/documents")
async def get_documents(current_user: dict = Depends(get_current_user)):
    docs = await db.documents.find(
        {"user_id": current_user["id"]},
        {"_id": 0, "id": 1, "filename": 1, "category": 1, "created_at": 1}
    ).to_list(100)
    return docs

# ==================== DOCUMENT ANALYSIS ====================

@api_router.post("/analyze-document/{document_id}")
async def analyze_document(document_id: str, query: str = Form(...), current_user: dict = Depends(get_current_user)):
    from elastoai_llm import LlmChat, UserMessage
    
    doc = await db.documents.find_one(
        {"id": document_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    prompt = f"""Analyze the following document content and answer the question.

**Document: {doc['filename']}**
{doc['content'][:15000]}

**Question:** {query}

Provide a detailed answer based on the document content, focusing on elastomer-related information."""

    llm_chat = LlmChat(
    system_message=ELASTOMER_SYSTEM_PROMPT
)
    
    response = await llm_chat.send_message(UserMessage(text=prompt))
    return {"analysis": response}

@api_router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):

    result = await db.documents.delete_one({
        "id": document_id,
        "user_id": current_user["id"]
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")

    return {"message": "Document deleted"}


# ==================== FORMULATION HISTORY ====================

@api_router.get("/formulation-history")
async def get_formulation_history(current_user: dict = Depends(get_current_user)):
    history = await db.formulation_history.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return history

# ==================== TRAINING DATA FOR FINE-TUNING ====================

@api_router.post("/training-data")
async def add_training_example(example: TrainingExample, current_user: dict = Depends(get_current_user)):
    """Add a training example for fine-tuning"""
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "prompt": example.prompt,
        "completion": example.completion,
        "category": example.category,
        "tags": example.tags,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.training_data.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/training-data")
async def get_training_data(current_user: dict = Depends(get_current_user)):
    """Get all training examples"""
    examples = await db.training_data.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return examples

@api_router.get("/training-data/stats")
async def get_training_stats(current_user: dict = Depends(get_current_user)):
    """Get training data statistics"""
    total = await db.training_data.count_documents({})
    categories = await db.training_data.aggregate([
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]).to_list(100)
    return {
        "total_examples": total,
        "by_category": {cat["_id"]: cat["count"] for cat in categories},
        "minimum_for_fine_tuning": 50,
        "recommended_for_fine_tuning": 200
    }

@api_router.delete("/training-data/{example_id}")
async def delete_training_example(example_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a training example"""
    result = await db.training_data.delete_one({"id": example_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Example not found")
    return {"message": "Example deleted"}

@api_router.get("/training-data/export")
async def export_training_data(format: str = "jsonl", current_user: dict = Depends(get_current_user)):
    """Export training data in JSONL format for OpenAI fine-tuning"""
    examples = await db.training_data.find({}, {"_id": 0}).to_list(10000)
    
    if format == "jsonl":
        # OpenAI fine-tuning format
        jsonl_data = []
        for ex in examples:
            jsonl_data.append({
                "messages": [
                    {"role": "system", "content": "You are ElastoAI, an expert AI assistant specialized in elastomer science and rubber formulation."},
                    {"role": "user", "content": ex["prompt"]},
                    {"role": "assistant", "content": ex["completion"]}
                ]
            })
        return {"format": "jsonl", "data": jsonl_data, "count": len(jsonl_data)}
    elif format == "csv":
        # Simple CSV format
        csv_data = [{"prompt": ex["prompt"], "completion": ex["completion"]} for ex in examples]
        return {"format": "csv", "data": csv_data, "count": len(csv_data)}
    else:
        raise HTTPException(status_code=400, detail="Invalid format. Use 'jsonl' or 'csv'")

@api_router.post("/training-data/bulk")
async def bulk_add_training_data(examples: List[TrainingExample], current_user: dict = Depends(get_current_user)):
    """Bulk add training examples"""
    docs = []
    for ex in examples:
        docs.append({
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "prompt": ex.prompt,
            "completion": ex.completion,
            "category": ex.category,
            "tags": ex.tags,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    if docs:
        await db.training_data.insert_many(docs)
    
    return {"message": f"Added {len(docs)} training examples", "count": len(docs)}

@api_router.post("/training-data/generate-from-chat/{session_id}")
async def generate_training_from_chat(session_id: str, current_user: dict = Depends(get_current_user)):
    """Convert a chat session into training examples"""
    session = await db.chat_sessions.find_one(
        {"session_id": session_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = session.get("messages", [])
    examples_created = 0
    
    # Pair user messages with assistant responses
    for i in range(len(messages) - 1):
        if messages[i]["role"] == "user" and messages[i+1]["role"] == "assistant":
            doc = {
                "id": str(uuid.uuid4()),
                "user_id": current_user["id"],
                "prompt": messages[i]["content"],
                "completion": messages[i+1]["content"],
                "category": "chat_derived",
                "tags": ["auto-generated", "from-chat"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.training_data.insert_one(doc)
            examples_created += 1
    
    return {"message": f"Created {examples_created} training examples from chat", "count": examples_created}

# ==================== ROOT ENDPOINT ====================

@api_router.get("/")
async def root():
    return {"message": "ElastoAI API - Elastomer Formulation Intelligence"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

import matplotlib.pyplot as plt
import io
import base64

def generate_stress_strain_curve():

    strain = [0,1,2,3,4,5]
    stress = [0,5,12,20,28,35]

    plt.figure()
    plt.plot(strain, stress)
    plt.xlabel("Strain")
    plt.ylabel("Stress")
    plt.title("Rubber Stress-Strain Curve")

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)

    image = base64.b64encode(buffer.read()).decode()

    return image


