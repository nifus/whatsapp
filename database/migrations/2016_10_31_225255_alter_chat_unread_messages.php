<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterChatUnreadMessages extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chats_members', function (Blueprint $table) {
            $table->smallInteger('unread')->default(0);
        });
        \DB::statement('ALTER TABLE `chats_posts` CHANGE `id` `id` BIGINT(10) UNSIGNED NOT NULL AUTO_INCREMENT;');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
