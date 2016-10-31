<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateIndexes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chats_members', function (Blueprint $table) {
            $table->index(['user_id', 'chat_id']);
        });
        Schema::table('chats_posts', function (Blueprint $table) {
            $table->index(['user_id', 'chat_id','is_deleted']);
        });
        Schema::table('users_contacts', function (Blueprint $table) {
            $table->index(['user_id', 'contact_id']);
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
