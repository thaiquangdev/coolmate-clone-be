import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTable1733456162623 implements MigrationInterface {
    name = 'UpdateTable1733456162623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collections\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`collections\` ADD \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP COLUMN \`highlights\``);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD \`highlights\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD \`description\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD \`description\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`product_spu\` DROP COLUMN \`highlights\``);
        await queryRunner.query(`ALTER TABLE \`product_spu\` ADD \`highlights\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`collections\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`collections\` ADD \`description\` varchar(255) NULL`);
    }

}
