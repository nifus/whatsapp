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

            $img = \Image::make( public_path('uploads/avatar/' . $name ) );
            $img->resize(150, 150);
            $img->save( public_path('uploads/avatar/' . $name), 60);


            $result = $name;
        }elseif (is_array($value)  && isset($value['base64'])) {
            $name = time() . rand(1, 10000) . '.' . pathinfo($value['filename'], PATHINFO_EXTENSION);
            file_put_contents(public_path('uploads/avatar/' . $name), base64_decode($value['base64']));
            $img = \Image::make( public_path('uploads/avatar/' . $name ) );
            $img->resize(150, 150);
            $img->save( public_path('uploads/avatar/' . $name), 60);

            
            $result = $name;
        }elseif (is_array($value)  && isset($value[0]) && is_string($value[0])) {
            $result = basename($value[0]);
        }else{
            $result = null;
        }
        $this->attributes['avatar'] = $result;
    }

    public function getAvatarAttribute(){
        if ( isset($this->attributes['avatar']) && $this->attributes['avatar']!=''){
            return '/uploads/avatar/'.$this->attributes['avatar'];
        }elseif ($this->last_post>0){
                return $this->LastPost->User->AvatarSrc;
        }else{
            return null;
        }
    }

    public function getAvatarSrcAttribute(){
        return $this->attributes['avatar'] == '' ? '/image/default.jpg' : '/uploads/avatar/' . $this->attributes['avatar'];

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

    public function addPost($data, $user){
        if ($data['type']=='text'){
            $post =  ChatPost::addTextPost($this->id, $data['message'], $data['reply_to'], $user);
        }elseif($data['type']=='image'){
            $post =  ChatPost::addImagePost($this->id, $data['image'], $data['message'], $data['reply_to'], $user);
        }

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

    public function addMember($user_id){
        $ids = [];
        $members = $this->Members()->get();

        foreach($members as $member){
            array_push($ids, ['user_id'=>$member->id,'is_admin'=>$member->pivot->is_admin,'sound'=>$member->pivot->sound]);
        }
        array_push($ids, ['user_id'=>$user_id,'is_admin'=>0,'sound'=>1]);

        $this->Members()->sync([]);
        $this->Members()->sync($ids);
    }

    public function removeMember($user_id){
        $ids = [];
        $members = $this->Members()->get();


        foreach($members as $member){

            if ( $member->id!=$user_id ){
                array_push($ids, ['user_id'=>$member->id,'is_admin'=>$member->pivot->is_admin,'sound'=>$member->pivot->sound]);
            }
        }
        $this->Members()->sync($ids);
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

        $chat_array = ['author'=>$user_id, 'is_group'=>1, 'name'=>$data['name']];
        if ( isset($data['avatar']) ){
            $chat_array['avatar'] = $data['avatar'];
        }
        $chat = self::create($chat_array);
        array_push($data['contacts'],$user_id);
        $chat->Members()->sync($data['contacts']);
        \DB::table('chats_members')->where('chat_id',$chat->id)->where('user_id', $user_id)->update(['is_admin'=>'1']);
       // $chat

        return $chat;
    }

}

