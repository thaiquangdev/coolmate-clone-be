import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1733218305734 implements MigrationInterface {
  name = 'CreateUserTable1733218305734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`full_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone_number\` varchar(255) NULL, \`password\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`password_reset_token\` varchar(255) NULL, \`password_reset_expiry\` timestamp NULL, \`email_verify\` tinyint NOT NULL DEFAULT 0, \`otp\` varchar(255) NULL, \`google_id\` varchar(255) NULL, \`facebook_id\` varchar(255) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
