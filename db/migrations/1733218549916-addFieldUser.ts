import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldUser1733218549916 implements MigrationInterface {
  name = 'AddFieldUser1733218549916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`refresh_token\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`refresh_token\``,
    );
  }
}
