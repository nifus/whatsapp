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
       // \DB::table('users')->truncate();

        $clears = [];

        foreach($users as $user){
            if ($user->clears!=''){
                $user->clears = json_decode($user->clears);
                $clears[$user->login] = $user->clears ;
            }


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


                $from = User::where('login',$message->from)->first();
                $to = User::where('login',$message->to)->first();
                if ( is_null($from) || is_null($to) ){
                    continue;
                }

                $chat = Chat::getChatWithUsers($from->id,$to->id);

                if (is_null($chat)){
                    $chat = Chat::create([
                        'author'=>$from->id,
                        'is_group'=>0
                    ]);


                    $to_login = $to->login;
                    $mems = [];

                    if ( isset($clears[$from->login]) && isset($clears[$from->login]->$to_login) ){
                        array_push($mems,['user_id'=>$from->id,'chat_id'=>$chat->id,'clear_date'=>date('Y-m-d H:i:s',$clears[$from->login]->$to_login)]);
                    }else{
                        array_push($mems,['user_id'=>$from->id,'chat_id'=>$chat->id]);
                    }
                    $from_login = $from->login;
                    if ( isset($clears[$to->login]) && isset($clears[$to->login]->$from_login) ){
                        array_push($mems,['user_id'=>$to->id,'chat_id'=>$chat->id,'clear_date'=>date('Y-m-d H:i:s',$clears[$to->login]->$from_login)]);
                    }else{
                        array_push($mems,['user_id'=>$to->id,'chat_id'=>$chat->id]);
                    }

                    $chat->Members()->sync($mems);
                    //\DB::table('chats_members')
                    if ( !empty($message->message)){
                        $chat->addPost([
                            'type'=>'text',
                            'message'=>$message->message,
                            'created_at'=>$message->date,
                        ],$from->id);
                    }

                }else{
                    if ( !empty($message->message)) {

                        $chat->addPost([
                            'type' => 'text',
                            'message' => $message->message,
                            'created_at' => $message->date,
                        ], $from->id);
                    }
                }
            }

        }catch( \Exception $e){
            var_dump($message);
            var_dump($from->id);
            var_dump($to->id);
            var_dump($chat);
            var_dump($e->getLine() );
            dd($e->getMessage());
        }

    }
}
