<?php

namespace App\Console\Commands;

use App\ChatPost;
use App\Chat;
use Illuminate\Console\Command;

class update_unread_posts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:unread';

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
            $users = $chat->Members;
            foreach($users as $user){

                $count = ChatPost::getCountUnreadPosts($chat->id, $user->id, $user->pivot->clear_date);
                \DB::table('chats_members')->where('chat_id', $chat->id)->where('user_id', $user->id)->update(['unread'=>$count]);
            }
        }
    }
}
