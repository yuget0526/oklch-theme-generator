#!/bin/bash
set -e

# Configuration
REPO_OWNER="gigaptera"
REPO_NAME="oklch-theme-generator"
POOL_NAME="github-actions-pool-v2"
PROVIDER_NAME="github-provider-v2"
SA_NAME="github-actions-deployer"
REGION="global" # WIF is global

echo "🚀 Setting up Workload Identity Federation for ${REPO_OWNER}/${REPO_NAME}..."

# 1. Check Project ID
PROJECT_ID="a11ypalette"
echo "Current Project: ${PROJECT_ID}"
# read -p "Is this the correct project ID? (y/n) " -n 1 -r
# echo
# if [[ ! $REPLY =~ ^[Yy]$ ]]; then
#    read -p "Enter Google Cloud Project ID: " PROJECT_ID
#    gcloud config set project "$PROJECT_ID"
# fi
gcloud config set project "$PROJECT_ID"

# 2. Enable APIs
echo "📦 Enabling required APIs..."
gcloud services enable iamcredentials.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com

# 3. Create Service Account
echo "👤 Creating Service Account ($SA_NAME)..."
if ! gcloud iam service-accounts describe "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" > /dev/null 2>&1; then
    gcloud iam service-accounts create "$SA_NAME" \
        --display-name="GitHub Actions Deployer"
else
    echo "  Service Account already exists."
fi

# 4. Grant Permissions
echo "🔑 Granting IAM permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin" > /dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin" > /dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser" > /dev/null
    
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin" > /dev/null

# 5. Create Workload Identity Pool
echo "🏊 Creating Workload Identity Pool..."
if ! gcloud iam workload-identity-pools describe "$POOL_NAME" --location="$REGION" > /dev/null 2>&1; then
    gcloud iam workload-identity-pools create "$POOL_NAME" \
        --location="$REGION" \
        --display-name="GitHub Actions Pool"
else
    echo "  Pool already exists."
fi

POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" --location="$REGION" --format='value(name)')

# 6. Create Workload Identity Provider
echo "🔌 Creating Workload Identity Provider..."
if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" --workload-identity-pool="$POOL_NAME" --location="$REGION" > /dev/null 2>&1; then
    gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
        --workload-identity-pool="$POOL_NAME" \
        --location="$REGION" \
        --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
        --issuer-uri="https://token.actions.githubusercontent.com"
else
    echo "  Provider already exists."
fi

# 7. Bind Service Account to GitHub Repo
echo "🔗 Binding Service Account to GitHub Repository..."
gcloud iam service-accounts add-iam-policy-binding "${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/${REPO_OWNER}/${REPO_NAME}" > /dev/null

PROVIDER_RESOURCE_NAME=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" --workload-identity-pool="$POOL_NAME" --location="$REGION" --format='value(name)')

echo ""
echo "✅ Setup Complete!"
echo "---------------------------------------------------"
echo "Please set the following secrets in GitHub:"
echo "Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo "WIF_PROVIDER:   $PROVIDER_RESOURCE_NAME"
echo "WIF_SERVICE_ACCOUNT: ${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "---------------------------------------------------"
