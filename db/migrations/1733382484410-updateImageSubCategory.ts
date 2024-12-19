import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateImageSubCategory1733382484410 implements MigrationInterface {
    name = 'UpdateImageSubCategory1733382484410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_categories\` DROP COLUMN \`image_id\``);
        await queryRunner.query(`ALTER TABLE \`sub_categories\` DROP COLUMN \`image_url\``);
        await queryRunner.query(`ALTER TABLE \`sub_categories\` ADD \`image\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sub_categories\` DROP COLUMN \`image\``);
        await queryRunner.query(`ALTER TABLE \`sub_categories\` ADD \`image_url\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sub_categories\` ADD \`image_id\` varchar(255) NOT NULL`);
    }

}
