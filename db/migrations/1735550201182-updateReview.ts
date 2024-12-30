import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReview1735550201182 implements MigrationInterface {
    name = 'UpdateReview1735550201182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_d02d60fbf0c8343ecce85a4e128\` FOREIGN KEY (\`parent_id\`) REFERENCES \`reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_d02d60fbf0c8343ecce85a4e128\``);
    }

}
