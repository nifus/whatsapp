<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
Use App\Chat;

class create_cache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cache:create';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $chats = Chat::get();
        foreach($chats as $chat){
            $chat->updateLastPosts();
        }
    }
}
