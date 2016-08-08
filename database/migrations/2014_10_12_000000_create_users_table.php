<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password', 60);
            $table->rememberToken();
            $table->timestamps();
            $table->string("avatar");
            $table->tinyInteger("is_deleted")->default(0);
            $table->tinyInteger("can_mass_messages")->default(0);
            $table->tinyInteger("can_upload_files")->default(0);
        });

        Schema::create('users_contacts', function (Blueprint $table) {
            $table->integer("user_id");
            $table->integer("contact_id");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('users');
        Schema::drop('users_contacts');
    }
}
