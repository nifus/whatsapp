<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateChatTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->increments('id');

            $table->timestamps();
            $table->string("name");
            $table->string("avatar");
            $table->integer("author");
            $table->integer("last_post");
            $table->tinyInteger("is_group")->default(0);
            $table->tinyInteger("is_deleted")->default(0);
            $table->tinyInteger("can_upload_files")->default(0);
        });



        Schema::create('chats_members', function (Blueprint $table) {
            $table->integer("user_id");
            $table->integer("chat_id");
            $table->smallInteger("is_admin")->default(0);
            $table->tinyInteger("sound")->default(1);
        });




        Schema::create('chats_posts', function (Blueprint $table) {
            $table->increments('id');
            $table->integer("chat_id");
            $table->integer("user_id");
            $table->text("message");
            $table->tinyInteger("is_system")->default(0);
            $table->tinyInteger("is_sent")->default(0);
            $table->tinyInteger("is_read")->default(0);
            $table->enum("type",['text','image','video'])->default('text');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('chats');
        Schema::drop('chats_members');
        Schema::drop('chats_posts');

    }
}
