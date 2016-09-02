<?php

namespace App;

use Illuminate\Database\Eloquent\Model;


class Chat extends Model
{


    protected $table = 'chats';


    protected $fillable = ['name', 'created_at', 'updated_at', 'avatar', 'author', 'last_post', 'is_group', 'is_deleted', 'can_upload_files'];

    public function Members()
    {
        return $this->belongsToMany('App\User',  'chats_members','chat_id','user_id') ->withPivot("sound", "is_admin");
    }

    public function LastPost()
    {
        return $this->hasOne('App\ChatPost',  'id','last_post');
    }

    public function Posts()
    {
        return $this->hasMany('App\ChatPost');
    }

    public function toArray()
    {
        $array = parent::toArray();


        //$array['name'] = $this->ChatName;

        $array['LastPost'] = $this->last_post!=null ? $this->LastPost : null;
        $array['AvatarSrc'] = $this->AvatarSrc;

        return $array;
    }

    public function setAvatarAttribute($value){
        if (is_array($value)  && isset($value[0]) && isset($value[0]['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value[0]['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/avatar/' . $name), base64_decode($value[0]['base64']));
            $result = $name;
        }elseif (is_array($value)  && isset($value['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/avatar/' . $name), base64_decode($value['base64']));
            $result = $name;
        }elseif (is_array($value)  && isset($value[0]) && is_string($value[0])) {
            $result = basename($value[0]);
        }else{
            $result = null;
        }
        $this->attributes['avatar'] = $result;
    }

    public function getAvatarSrcAttribute(){
        if ($this->avatar){
            return '/uploads/avatar/'.$this->attributes['avatar'];
        }elseif ($this->last_post!=null){
                return $this->LastPost->User->AvatarSrc;
        }else{
            return null;
        }

    }

    public function canAccess($user_id){
        $members = $this->Members()->get();

        foreach($members as $member){

            if ( $member->id==$user_id){
                return true;
            }
        }
            return false;
    }

    public function getPosts($start, $limit){
        return ChatPost::getPosts($this->id, $start, $limit);

    }

    public function updateLastPost($post_id=null){
        if (is_null($post_id)){
            $post = ChatPost::getLastPost($this->id);
            if (!is_null($post)){
                $post_id = $post->id;
            }else{
                $post_id = null;
            }
        }
        $this->update(['last_post'=>$post_id]);
    }

    public function addPost($message, $type, $user){
        $post =  ChatPost::addPost($this->id, $message, $type, $user);
        $this->updateLastPost($post->id);
        return $post;
    }

    public function updateSound($user, $flag){
        \DB::table('chats_members')->where('user_id', $user)->where('chat_id', $this->id)->update(['sound'=>$flag]);
        //$members = $this->Members();
        //dd($members);
    }

    public function clearAllPosts(){
        $this->Posts()->update(['is_deleted'=>'1']);
        $this->update(['last_post'=>null]);
    }

    public function remove(){
        $this->Posts()->update(['is_deleted'=>'1']);
        $this->update(['is_deleted'=>1]);
    }

    public function readPosts4User($user_id){
        ChatPost::readPosts4User($this->id, $user_id);
    }

    static function createNewChat($user_id, $users_ids){
        //$user_chats = self::where('author', $user_id)->where('')->get();

        $data = ['author'=>$user_id];
        $chat = self::create($data);
        array_push($users_ids,$user_id);
        $chat->Members()->sync($users_ids);
       // $chat

        return $chat;
    }
    static function createNewGroup($user_id, $data){
        //$user_chats = self::where('author', $user_id)->where('')->get();

        $chat_array = ['author'=>$user_id, 'is_group'=>1, 'avatar'=>$data['avatar'], 'name'=>$data['name']];
        $chat = self::create($chat_array);
        array_push($data['contacts'],$user_id);
        $chat->Members()->sync($data['contacts']);
        \DB::table('chats_members')->where('chat_id',$chat->id)->where('user_id', $user_id)->update(['is_admin'=>'1']);
       // $chat

        return $chat;
    }

}

