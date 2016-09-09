<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterChatPostReply extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chats_posts', function (Blueprint $table) {
            $table->dropColumn('message');
        });

        Schema::table('chats_posts', function (Blueprint $table) {
            $table->string('image')->nullable();
            $table->integer('reply_to')->nullable();
            $table->text('message')->nullable();
        });
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
