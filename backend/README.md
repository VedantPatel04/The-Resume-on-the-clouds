# Backend — visitor counter

Serverless visitor counter: DynamoDB (storage) → Lambda (logic) → API Gateway (HTTP endpoint).
Every piece here is either "Always Free" (DynamoDB, Lambda) or free for 12 months
at far higher volume than a resume site will ever see (API Gateway).

## 1. DynamoDB table

Console → DynamoDB → **Create table**
- Table name: `cloud-resume-visitor-count`
- Partition key: `id` (String)
- Table settings: **On-demand** capacity (no RCU/WCU to misconfigure, still free tier at this scale)

After it's created, add the starting item:
- Open the table → **Explore table items** → **Create item**
- `id` = `visitor_count` (String), `count` = `0` (Number)

## 2. IAM role for the Lambda function

Console → IAM → Roles → **Create role**
- Trusted entity: AWS service → Lambda
- Permissions: attach `AWSLambdaBasicExecutionRole` (for CloudWatch logs), then add an
  inline policy scoped to just this table:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "dynamodb:UpdateItem",
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/cloud-resume-visitor-count"
    }
  ]
}
```
- Name it something like `cloud-resume-lambda-role`

## 3. Lambda function

Console → Lambda → **Create function**
- Author from scratch
- Name: `cloud-resume-visitor-counter`
- Runtime: Python 3.13 (or latest available)
- Execution role: use the existing role from step 2
- After creation, paste the contents of `lambda_function.py` into the code editor (or upload
  it as a `.zip`) and **Deploy**
- Configuration → Environment variables: add `TABLE_NAME` = `cloud-resume-visitor-count`
- Add `ALLOWED_ORIGIN` = your CloudFront URL (for example,
  `https://d123example.cloudfront.net`). Use `*` only during initial testing.
- Handler should be `lambda_function.handler` (this is the default — just confirm it matches)

Quick test: Lambda console → **Test** tab → run with an empty `{}` event. You should get back
`{"statusCode": 200, "body": "{\"count\": 1}"}` and see the count increment in DynamoDB each time.

## 4. API Gateway (HTTP API)

Console → API Gateway → **Create API** → **HTTP API** → Build
- Add integration: Lambda → select `cloud-resume-visitor-counter`
- Configure route: `GET /count`
- Configure stage: `$default` (auto-deploy on)
- **CORS**: under the API's CORS settings, set:
  - Access-Control-Allow-Origin: your CloudFront URL once you have it (use `*` temporarily
    while testing)
  - Access-Control-Allow-Methods: `GET`
- Deploy, then copy the **Invoke URL** — it'll look like
  `https://abc123xyz.execute-api.us-east-1.amazonaws.com`

Your full endpoint is `{Invoke URL}/count`.

## 5. Wire it into the frontend

Create `frontend/.env.local` from the committed example and set the full endpoint:

```dotenv
VITE_API_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/count
```

Test locally (`npm run dev` in `frontend/`) before deploying — you should see a real,
incrementing number in the visitor badge instead of "—".

For GitHub Actions, create the repository variable `VITE_API_URL` with the same value. The URL
is necessarily public in the browser bundle, so it is configuration rather than a secret.

## 6. Run the backend tests

```bash
cd backend
python -m unittest -v
```

The tests cover a successful increment, an `OPTIONS` preflight that does not increment the
counter, and a safe response when DynamoDB fails.

## Staying free

- DynamoDB on-demand + Lambda + this API Gateway usage are all far under free-tier ceilings
  for a personal resume site (thousands of monthly requests, not millions).
- The only way to rack up a real bill here is a traffic spike into the millions of requests,
  which isn't a realistic risk for this project — but the billing alarm from Phase 2 will catch
  it regardless.
