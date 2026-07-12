data "aws_caller_identity" "current" {}

locals {
  # The Amplify app is created + GitHub-App-connected in the console; Terraform
  # scopes the deploy role to that app's ARN (no wildcard across apps).
  amplify_app_arn = "arn:aws:amplify:${var.aws_region}:${data.aws_caller_identity.current.account_id}:apps/${var.amplify_app_id}"
}

data "aws_iam_policy_document" "deploy_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_owner}/${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "gha-246labs-deploy"
  assume_role_policy = data.aws_iam_policy_document.deploy_trust.json
}

data "aws_iam_policy_document" "deploy_perms" {
  statement {
    effect = "Allow"
    actions = [
      "amplify:StartJob",
      "amplify:GetJob",
      "amplify:GetApp",
      "amplify:GetBranch",
    ]
    resources = [
      local.amplify_app_arn,
      "${local.amplify_app_arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "amplify-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy_perms.json
}
