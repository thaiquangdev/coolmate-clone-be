import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableReview1735530945548 implements MigrationInterface {
    name = 'AddTableReview1735530945548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reviews\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`product_id\` int NOT NULL, \`sku\` varchar(255) NOT NULL, \`color\` varchar(255) NOT NULL, \`size\` varchar(255) NOT NULL, \`comment\` varchar(255) NOT NULL, \`star\` int NOT NULL, \`isReply\` tinyint NULL, \`parent_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`payment_status\` \`payment_status\` varchar(255) NOT NULL DEFAULT 'đang chờ'`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_728447781a30bc3fcfe5c2f1cdf\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_9482e9567d8dcc2bc615981ef44\` FOREIGN KEY (\`product_id\`) REFERENCES \`product_spu\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_9482e9567d8dcc2bc615981ef44\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_728447781a30bc3fcfe5c2f1cdf\``);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`payment_status\` \`payment_status\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`reviews\``);
    }

}
