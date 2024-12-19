import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldAccount1733276477606 implements MigrationInterface {
    name = 'AddFieldAccount1733276477606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`account_type\` enum ('google', 'facebook', 'local') NOT NULL DEFAULT 'local'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`account_type\``);
    }

}
