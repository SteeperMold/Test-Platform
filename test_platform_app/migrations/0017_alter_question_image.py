# Generated by Django 4.2.3 on 2023-08-13 16:08

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('test_platform_app', '0016_question_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='images/'),
        ),
    ]
