import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableRole1733500981373 implements MigrationInterface {
    name = 'AddTableRole1733500981373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`role_name\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'hoạt động', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`usersId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`role_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD CONSTRAINT \`FK_47c137eb80082b6e12f9936acae\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_47c137eb80082b6e12f9936acae\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
    }

}
