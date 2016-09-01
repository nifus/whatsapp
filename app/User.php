<?php

namespace App;

use Faker\Provider\DateTime;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Mockery\CountValidator\Exception;
//use App\Events\UserEvent;
use App\Group;

class User extends Authenticatable
{

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'email', 'password', 'group_id', 'is_deletedd', 'avatar', 'can_mass_messages', 'can_upload_files', 'last_login', 'history', 'can_edit_myself', 'last_action', 'login'];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];


    public function toArray()
    {
        $array = parent::toArray();
        $array['Status'] = $this->getStatusAttribute();
        $array['AvatarSrc'] = $this->getAvatarSrcAttribute();
        $array['LastActionString'] = $this->getLastActionStringAttribute();
       // $array['Users'] = $this->getUsersAttribute();

        return $array;
    }

    public function Group()
    {
        return $this->hasOne('App\Group', 'id', 'group_id');
    }

    public function Contacts()
    {
        return $this->belongsToMany('App\User', 'users_contacts', 'user_id', 'contact_id');
    }

    public function Chats()
    {
        return $this->belongsToMany('App\Chat', 'chats_members', 'user_id')->where('is_deleted',0)->with('Members');
        //return $this->hasMany('App\Chat', 'author', 'id')->where('is_deleted',0)->with('Members');
    }


    public function getStatusAttribute()
    {
        return $this->attributes['is_deleted'] == '0' ? trans('app.user.activeStatus') : trans('app.user.deletedStatus');
    }

    public function getLastActionStringAttribute()
    {

        if (($this->attributes['last_action'])) {
            $date = new \DateTime($this->attributes['last_action']);
            return $date->format('Y-m-d H:i:s');
        } else {
            return '-';
        }


    }

    public function getUsersAttribute()
    {

        $users = [];
        $contacts = $this->Contacts() ->get();
        foreach($contacts as $contact){
            array_push($users, $contact->login);
        }
        return implode($users,',');
    }

    public function getAvatarSrcAttribute()
    {
        return $this->attributes['avatar'] == '' ? '/image/default.jpg' : '/uploads/avatar/' . $this->attributes['avatar'];
    }

    public function getAvatarAttribute()
    {
        return $this->attributes['avatar'] == '' ? null : '/uploads/avatar/' . $this->attributes['avatar'];
    }

    public function setAvatarAttribute($value)
    {
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



    public function delete()
    {
        $oldStatus = $this->Status;
        $this->update(['is_deleted' => '1']);
        // event(new UserEvent($this, $oldStatus));

        return $this;
    }

    public function restore()
    {
        $oldStatus = $this->Status;
        $this->update(['is_deleted' => '0']);
        //   event(new UserEvent($this, $oldStatus));

        return $this;
    }

    public function updateUser(array $data)
    {

        self::userValidation($data, false, $this->id);

        if (isset($data['password'])) {
            $data['password'] = \Hash::make($data['password']);
        }
        //$old = $this->toArray();
        //$this->fill($data);
       // $changed = $this->getDirty();
        $this->update($data);
        $this->sinxContacts($data['users']);
        //event(new UserEvent('change', $old, $changed));
    }

    public function updateLastLogin()
    {
        $date = new \DateTime();
        $this->update(['last_login' => $date->format('Y-m-d H:i:s')]);
    }

    public function updateLastAction()
    {
        $date = new \DateTime();
        $this->update(['last_action' => $date->format('Y-m-d H:i:s')]);
    }

    public function sinxContacts($names){
        $contact_ids = [];
        $names = explode(',',$names);
        foreach($names as $name){
            $name= trim($name);
            $user = User::findByLogin($name);
            if ( is_null($user) ){
                continue;
            }
            array_push($contact_ids, $user->id);
            $user->addNewContact($this->id);

        }
        $this->Contacts()->sync($contact_ids);
        return true;
    }

    public function addNewContact($user_id){
        $contact_ids = [];
        $contacts = $this->Contacts()->get();
        foreach($contacts as $contact){
            if ($contact->contact_id!=$user_id){
                array_push($contact_ids, $contact->contact_id);
            }
        }
        array_push($contact_ids, $user_id);
        $this->Contacts()->sync($contact_ids);
    }

    static function userValidation($data, $create = true, $user_id = null)
    {
        $rules = [
            'login' => 'required|max:255|unique:users,login',
            'group_id' => 'required',
        ];

        if ($create) {
            $rules['password'] = 'same:re_password';
        } else {
            $rules['login'] = 'required|max:255|unique:users,login,' . $user_id;
        }
        $validator = \Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }
    }

    static function createNewActivatedUser($data)
    {
        self::userValidation($data);
        // $data['activated'] = 1;
        $data['password'] = \Hash::make($data['password']);
        $user = self::create($data);
        // event(new UserEvent($user, 'create'));
        return $user;
    }


    static function getAllUsers()
    {
        return self::with('Group')
            //->where('is_deleted',0)
            ->orderBy('id', 'DESC')->get();
    }

    static function find($id)
    {
        return self::with('Group')->find($id);
    }

    static function findByLogin($login)
    {
        if (empty($login)){
            return null;
        }
        return self::where('login', $login)->first();
    }

    static function getUserByLogin($login)
    {
        return self::with('Group')
            ->where('login', $login)
            ->where('is_deleted', '0')
            ->get()->first();
    }

    static function getUser()
    {
        $token = \JWTAuth::parseToken();
        if (!$token) {
            return null;
        }
        return $token->authenticate();
    }
}
