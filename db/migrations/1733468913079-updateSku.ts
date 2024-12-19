import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSku1733468913079 implements MigrationInterface {
    name = 'UpdateSku1733468913079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_sku\` DROP COLUMN \`color_slug\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_sku\` ADD \`color_slug\` varchar(255) NOT NULL`);
    }

}
