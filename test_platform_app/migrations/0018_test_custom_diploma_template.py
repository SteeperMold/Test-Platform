# Generated by Django 4.2.3 on 2023-08-19 15:44

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('test_platform_app', '0017_alter_question_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='test',
            name='custom_diploma_template',
            field=models.FileField(blank=True, null=True, upload_to='diploma_templates/'),
        ),
    ]
