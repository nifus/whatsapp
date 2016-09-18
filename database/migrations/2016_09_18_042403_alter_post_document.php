<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterPostDocument extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('chats_posts', function (Blueprint $table) {
            $table->dropColumn('type');
        });
        Schema::table('chats_posts', function (Blueprint $table) {
            $table->string('document')->nullable();
            $table->enum('type',['text', 'image', 'document'])->default('text');
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
