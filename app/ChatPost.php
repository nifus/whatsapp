<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class ChatPost extends Model
{


    protected
        $fillable = ['chat_id', 'user_id','message','is_system','is_sent','is_read','type','created_at','updated_at','is_deleted'],
        $table = 'chats_posts';


    public function User()
    {
        return $this->hasOne('App\User',  'id','user_id');
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['Time'] = $this->Time;
        $array['User'] = $this->User;
        return $array;
    }


    public function getTimeAttribute(){
        $date = new \DateTime($this->created_at);
        return $date->format('H:i');
    }

    public function remove(){
        $this->update(['is_deleted'=>'1']);
    }

    static function getPosts($chat_id, $start, $limit){
        return self::where('chat_id',$chat_id)->where('is_deleted','0')->orderBy('created_at','DESC')->limit(50)->get();
    }

    static function addPost($chat, $message, $type, $user,  $is_system=0){
        $message = trim($message);
        if ( $message==''){
            return null;
        }
        return self::create([
            'chat_id'=>$chat,
            'user_id'=>$user,
            'message'=>$message,
            'type'=>$type,
            'is_sent'=>'1',
            'is_system'=>$is_system,
            'is_deleted'=>'0',
            'is_read'=>'0',
        ]);
    }

    static function getCountUnreadPosts($chat_id, $user_id){

        return self::where('chat_id', $chat_id)->where('user_id','!=',$user_id)->where('is_read','0')->where('is_deleted','0')->count();
    }

    static function readPosts4User($chat_id, $user_id){
        return self::where('chat_id', $chat_id)->where('user_id','!=',$user_id)->where('is_read','0')->where('is_deleted','0')->update(['is_read'=>'1']);

    }


}
