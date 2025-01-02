import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddTeacherIdColumn {
    async up(queryRunner) {
        await queryRunner.addColumn(
            'user',
            new TableColumn({
                name: 'teacherId',
                type: 'int',
                isNullable: true
            })
        );

        await queryRunner.createForeignKey(
            'user',
            new TableForeignKey({
                columnNames: ['teacherId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'user',
                onDelete: 'SET NULL'
            })
        );
    }

    async down(queryRunner) {
        const table = await queryRunner.getTable('user');
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('teacherId') !== -1);
        await queryRunner.dropForeignKey('user', foreignKey);
        await queryRunner.dropColumn('user', 'teacherId');
    }
} 