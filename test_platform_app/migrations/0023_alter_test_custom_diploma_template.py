# Generated by Django 4.2.3 on 2023-08-20 17:38

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('test_platform_app', '0022_remove_test_custom_diploma_template_content_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='test',
            name='custom_diploma_template',
            field=models.FileField(blank=True, null=True, upload_to='diploma_templates/'),
        ),
    ]
