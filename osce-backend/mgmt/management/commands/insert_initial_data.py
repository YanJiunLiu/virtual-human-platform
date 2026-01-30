from django.core.management.base import BaseCommand
from django.db import connection
from pathlib import Path

class Command(BaseCommand):
    help = 'insert initial data in SQL database'

    def handle(self, *args, **options):
        current = Path(__file__).resolve()
        root_path = current.parent.parent  # 根目錄，如 manage.py 同一層
        initial_sql_path = root_path / 'static' / 'initial.sql'

        with open(initial_sql_path, 'r', encoding='utf-8') as file:
            sql = file.read()

        print(connection)
        with connection.cursor() as cursor:
            db_backend = connection.vendor
            if db_backend == 'sqlite':
                cursor.executescript(sql)
            else:
                for statement in sql.split(';'):
                    if statement.strip():
                        cursor.execute(statement)
        self.stdout.write(self.style.SUCCESS('執行完成'))
