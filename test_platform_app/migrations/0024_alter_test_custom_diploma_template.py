# Generated by Django 4.2.3 on 2023-10-18 17:25

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('test_platform_app', '0023_alter_test_custom_diploma_template'),
    ]

    operations = [
        migrations.AlterField(
            model_name='test',
            name='custom_diploma_template',
            field=models.TextField(blank=True, null=True),
        ),
    ]
