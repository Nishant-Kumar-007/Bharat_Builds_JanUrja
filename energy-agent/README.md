# JanUrja Energy Intelligence Agent Backend (`energy-agent`)

Autonomous P2P microgrid energy intelligence backend built using the **AWS open-source Strands Agents SDK** (`strands-agents`) integrated with the **Google Gemini API** (`GeminiModel` via `google-genai`).

> [!NOTE]
> **Simulation Notice**: JanUrja operates in microgrid simulation mode. All clearing prices, energy matches, and environmental figures are generated for local microgrid modeling and testing.

---

## 1. Prerequisites & Setup (Windows PowerShell)

Ensure Python 3.10+ is installed.

```powershell
# Navigate to the energy-agent directory
cd energy-agent

# (Optional) Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

---

## 2. Configuration & Environment Variables

Create your local `.env` file from the provided template:

```powershell
cp .env.example .env
```

Edit `.env` with your settings:

```ini
# Google Gemini API key (Get one from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Model ID (Defaults to gemini-2.5-flash)
GEMINI_MODEL_ID=gemini-2.5-flash

# Model Temperature (0.0 = fully deterministic reasoning)
MODEL_TEMPERATURE=0.2

# Server Port
PORT=8000
HOST=0.0.0.0

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

> [!IMPORTANT]
> **Offline Fallback Guarantee**: If `GEMINI_API_KEY` is not provided or Gemini is unreachable, the system automatically runs the **Deterministic Fallback Engine**. All numerical matching, pricing, and environmental algorithms run locally without network or cloud dependencies.

---

## 3. Running the Backend Server

Start the FastAPI application with `uvicorn`:

```powershell
python -m uvicorn app.main:app --reload --port 8000
```

The interactive OpenAPI / Swagger documentation will be available at:
`http://localhost:8000/docs`

---

## 4. Running Automated Tests

Run the full automated test suite (29 tests across tools, Strands protocol, API endpoints, and fallback logic):

```powershell
python -m pytest -v tests/
```

---

## 5. API Endpoints & cURL / PowerShell Examples

### A. Health Check (Safe, no secret exposure)
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get | ConvertTo-Json
```
Response:
```json
{
  "status": "healthy",
  "service": "janurja-energy-agent",
  "model_provider": "deterministic_fallback",
  "has_gemini_key": false,
  "is_simulation": true
}
```

### B. Prosumer Dynamic Pricing Evaluation
```powershell
$body = @{
    base_price = 6.20
    rule = "Auto-price dynamically: Undercut grid tariff by 15% and stay above ₹5.50/unit."
    grid_tariff = 7.80
    feed_in_rate = 2.90
    zone_congestion = 0.42
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/pricing/evaluate" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
```

### C. Multi-Criteria Peer Offer Matching & Feeder Constraint Check
```powershell
$body = @{
    consumer_zone = "S2-East"
    requested_kwh = 10.0
    feeder_constraints = @{
        feeder_capacity_kwh = 100.0
        current_feeder_load_kwh = 25.0
    }
    offers = @(
        @{
            id = "offer-hebbal"
            seller_name = "Hebbal Solar Research Park"
            grid_zone = "S1-North"
            price_per_kwh = 5.80
            quantity_kwh = 15.0
            min_quantity_kwh = 2.0
            status = "active"
            renewable_percentage = 99.5
            distance_km = 0.8
        },
        @{
            id = "offer-indiranagar"
            seller_name = "Indiranagar Rooftop Co-op"
            grid_zone = "S2-East"
            price_per_kwh = 6.20
            quantity_kwh = 22.5
            min_quantity_kwh = 2.0
            status = "active"
            renewable_percentage = 95.0
            distance_km = 1.2
        }
    )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:8000/api/matching/find" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

### D. Environmental and Economic Impact
```powershell
$body = @{
    quantity_kwh = 25.0
    grid_emission_factor_kg_per_kwh = 0.54
    grid_standard_tariff = 7.80
    purchased_price_per_kwh = 6.00
    wheeling_charge_per_kwh = 0.15
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/impact/calculate" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
```

### E. Conversational Agent Query
```powershell
$body = @{
    query = "Find the best solar offer for 8 kWh in S2-East"
    requested_kwh = 8.0
    consumer_zone = "S2-East"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/agent/chat" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json
```

---

## 6. Architecture & Safety Safeguards

1. **Deterministic Authority**: All arithmetic, pricing formulas, line limits, and emission metrics are computed in pure Python functions. The LLM explains these results and cannot invent values.
2. **Hard Constraints**:
   - Total active supply availability vs. requested demand.
   - 11kV Feeder line headroom (`current_load + requested_kwh <= feeder_capacity`).
   - Transaction lot size minimums.
   - Status active validation.
3. **Soft Preferences**:
   - Distance normalization (0-5 km).
   - Price normalization (₹5.0 - ₹8.0).
   - Solar renewable percentage (0-100%).
   - Intra-zone locality bonus.
4. **Security**:
   - No API keys committed or printed in logs.
   - 1MB max payload guard on FastAPI middleware.
   - Least-privilege IAM policies on AWS Lambda roles.

---

## 7. AWS Serverless Deployment Guide (AWS SAM)

The application includes an AWS Serverless Application Model (`template.yaml`) designed for zero-idle cost and minimal attack surface.

### A. AWS Resources Provisioned
1. **Amazon API Gateway (HTTP API)**: HTTPS endpoint routing traffic to FastAPI with CORS support.
2. **AWS Lambda (`EnergyAgentFunction`)**: Runs the FastAPI application with Mangum.
3. **AWS Systems Manager Parameter Store**: SecureString parameter `/janurja/gemini_api_key` storing your Google Gemini key.
4. **Amazon DynamoDB (`JanUrjaGridEvents`)**: Pay-per-request table storing microgrid analyses, congestion events, and TTL automated expiration.
5. **Amazon SNS (`JanUrjaGridAlerts`)**: Topic for high-severity feeder alerts with deduplication and cooldown.
6. **Amazon EventBridge (`JanUrjaPeriodicGridAnalysisSchedule`)**: Periodic grid health check (defaults to `DISABLED` to prevent unintended invocations).

### B. Deployment Steps (Requires AWS CLI & SAM CLI)

```powershell
# 1. Store your Gemini API key in SSM Parameter Store (SecureString)
aws ssm put-parameter `
    --name "/janurja/gemini_api_key" `
    --value "YOUR_ACTUAL_GEMINI_KEY" `
    --type "SecureString" `
    --region "ap-south-1"

# 2. Build the serverless application
sam build --use-container

# 3. Deploy guided (First-time)
sam deploy --guided `
    --stack-name "janurja-energy-agent" `
    --region "ap-south-1" `
    --capabilities CAPABILITY_IAM
```

### C. Teardown / Rollback Commands
To delete all AWS resources and eliminate any ongoing charges:

```powershell
# Delete the entire CloudFormation / SAM stack
sam delete --stack-name "janurja-energy-agent" --region "ap-south-1" --no-prompts

# (Optional) Delete the SSM Parameter Store secret
aws ssm delete-parameter --name "/janurja/gemini_api_key" --region "ap-south-1"
```

