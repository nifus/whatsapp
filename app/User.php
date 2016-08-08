<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Mockery\CountValidator\Exception;
use App\Events\UserEvent;
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
    protected $fillable = ['name', 'email', 'password', 'language', 'group_id', 'is_delete', 'access'];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];


    public function toArray()
    {
        $array = parent::toArray();
        $array['DashboardUrl'] = $this->getDashboardUrlAttribute();
        $array['Status'] = $this->getStatusAttribute();
        if (isset($array['group']['access']) && !isset($array['access'])) {
            $array['access'] = $array['group']['access'];
        }
        return $array;
    }

    public function Group()
    {
        return $this->hasOne('App\Group', 'id', 'group_id');
    }

    public function getAccessAttribute()
    {
        if (!empty($this->attributes['access'])) {
            return json_decode($this->attributes['access']);
        } else {
            return null;
        }
    }

    public function setAccessAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['access'] = json_encode($value);
        } else {
            $this->attributes['access'] = json_encode([]);

        }
    }

    public function getDashboardUrlAttribute()
    {
        return '/admin.html';
        //route('admin.dashboard',[],false);
    }

    public function getStatusAttribute()
    {
        return $this->attributes['is_delete'] == '0' ? trans('app.user.activeStatus') : trans('app.user.deletedStatus');

    }

    public function delete()
    {
        $oldStatus = $this->Status;
        $this->update(['is_delete' => '1']);
        event(new UserEvent($this, $oldStatus));

        return $this;
    }

    public function restore()
    {
        $oldStatus = $this->Status;
        $this->update(['is_delete' => '0']);
        event(new UserEvent($this, $oldStatus));

        return $this;
    }

    public function updateUser(array $data)
    {
        self::userValidation($data, false, $this->id);
        if (isset($data['password'])) {
            $data['password'] = \Hash::make($data['password']);
        }
        $old = $this->toArray();
        $this->fill($data);
        $changed = $this->getDirty();
        $this->update($data);
        event(new UserEvent('change', $old, $changed));
    }

    static function userValidation($data, $create = true, $user_id = null)
    {
        $rules = [
            'email' => 'required|max:255|unique:users,email',
            'name' => 'required',
            'group_id' => 'required',
        ];

        if ($create) {
            $rules['password'] = 'same:re_password';
        } else {
            $rules['email'] = 'required|max:255|unique:users,email,' . $user_id;
        }
        $validator = \Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }
    }

    static function createNewActivatedUser($data)
    {
        self::userValidation($data);
        $data['activated'] = 1;
        $data['password'] = \Hash::make($data['password']);
        $user = self::create($data);
        event(new UserEvent($user, 'create'));
        return $user;
    }


    static function getAllUsers()
    {
        return self::with('Group')
            //->where('is_delete',0)
            ->orderBy('id', 'DESC')->get();
    }

    static function find($id)
    {
        return self::with('Group')->find($id);
    }

    static function getUserByEmail($email)
    {
        return self::with('Group')
            ->where('email', $email)
            ->where('is_delete', '0')
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
