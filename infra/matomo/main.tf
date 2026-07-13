data "aws_subnet" "chosen" {
  id = tolist(data.aws_subnets.default.ids)[0]
}

resource "aws_security_group" "matomo" {
  name        = "matomo"
  description = "Matomo: HTTPS + ACME only, no SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTP (ACME + redirect)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ebs_volume" "data" {
  availability_zone = data.aws_subnet.chosen.availability_zone
  size              = var.data_volume_gb
  type              = "gp3"
  encrypted         = true
  tags              = { Name = "matomo-data", Snapshot = "matomo-data" }
}

resource "aws_instance" "matomo" {
  ami                    = data.aws_ssm_parameter.al2023_arm.value
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnet.chosen.id
  vpc_security_group_ids = [aws_security_group.matomo.id]
  iam_instance_profile   = aws_iam_instance_profile.matomo.name

  metadata_options {
    http_tokens   = "required" # IMDSv2
    http_endpoint = "enabled"
  }
  root_block_device {
    volume_type = "gp3"
    volume_size = 16
    encrypted   = true
  }
  user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    hostname      = var.analytics_hostname
    backup_bucket = aws_s3_bucket.backups.bucket
    region        = var.aws_region
    admin_email   = "admin@246labs.cloud"
    compose_yml   = file("${path.module}/stack/docker-compose.yml")
    caddyfile     = file("${path.module}/stack/Caddyfile")
    backup_sh     = file("${path.module}/stack/backup.sh")
  })
  tags = { Name = "matomo" }
}

resource "aws_volume_attachment" "data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.data.id
  instance_id = aws_instance.matomo.id
}

resource "aws_eip" "matomo" {
  instance = aws_instance.matomo.id
  domain   = "vpc"
  tags     = { Name = "matomo" }
}
