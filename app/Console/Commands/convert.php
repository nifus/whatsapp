<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\User;
use App\ChatPost;
use App\Chat;

class convert extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'convert';

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
        $users = \DB::table('users_old')->get();
        \DB::table('users')->truncate();


        foreach($users as $user){
            $friends = str_replace('[','',$user->friends );
            $friends = str_replace(']','',$friends );
            $friends = explode(',',$friends );

            $user = User::create(
                [
                    'id'=>$user->id,
                    'old_pass'=>$user->password,
                    'group_id'=>2,
                    'login'=>$user->login,
                    'name'=>$user->login,
                    'created_at'=>$user->registration,
                    'history'=>$user->history,
                    'can_upload_files'=>$user->files,
                ]
            );
            $user->Contacts()->sync( $friends );
        }

        \DB::table('chats')->truncate();
        \DB::table('chats_members')->truncate();
        \DB::table('chats_posts')->truncate();

        $messages = \DB::table('history')->orderBy('date','ASC')->get();
        try{

            foreach($messages as $message){
                $this->line('Сообщение #'.$message->id);

                $message->from ;
                $from = User::where('login',$message->from)->first();
                $to = User::where('login',$message->to)->first();

                $chat = Chat::getChatWithUsers($from->id,$to->id);
                if (is_null($chat)){
                    $chat = Chat::create([
                        'author'=>$from->id,
                        'is_group'=>0
                    ]);
                    $chat->Members()->sync([$from->id, $to->id]);
                    $chat->addPost([
                        'type'=>'text',
                        'message'=>$message->message,
                        'created_at'=>$message->date,
                    ],$from->id);
                }else{
                    $chat->addPost([
                        'type'=>'text',
                        'message'=>$message->message,
                        'created_at'=>$message->date,
                    ],$from->id);
                }
            }

        }catch( \Exception $e){
            var_dump($message);
            var_dump($from->id);
            var_dump($to->id);
            var_dump($chat);
            dd($e->getMessage());
        }

    }
}
