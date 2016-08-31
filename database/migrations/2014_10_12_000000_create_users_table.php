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
            $table->string('email');
            $table->string('password', 60);
            $table->rememberToken();
            $table->timestamps();
            $table->string("avatar")->nullable();
            $table->string("is_deleted",1)->default(0);
            $table->string("can_mass_messages",1)->default(0);
            $table->string("can_upload_files",1)->default(0);
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
