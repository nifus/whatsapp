<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Payment;
use App\Events\AgentEvent;
use App\Events\AgentErrorEvent;

class Agent extends Model
{


    protected $table = 'agents';


    protected $fillable = ['name', 'created_at', 'updated_at', 'phone', 'email', 'report_delivery', 'day_delivery', 'info_delivery', 'comment', 'files', 'is_deleted', 'number_of_payments', 'debt'];


    public function Companies()
    {
        return $this->hasMany('App\Company')->orderBy('created_at', 'ASC');
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['number_of_complete_payments'] = Payment::getCountCompletePaymentsForAgent($this->id);
        $array['number_of_uncomplete_payments'] = Payment::getCountUncompletePaymentsForAgent($this->id);
        $array['number_of_payments'] = $array['number_of_complete_payments']+$array['number_of_uncomplete_payments'];

        return $array;
    }


    public function getDebtAttribute()
    {
        try {
            return json_decode($this->attributes['debt']);
        } catch (\Exception $e) {
        }
        return [];
    }

    public function setDebtAttribute($value)
    {
        $value = is_array($value) ? $value : [];
        $this->attributes['debt'] = json_encode($value, JSON_UNESCAPED_UNICODE);
    }


    public function setDayDeliveryAttribute($value)
    {
        $value = is_array($value) ? $value : [];
        $this->attributes['day_delivery'] = json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    public function getDayDeliveryAttribute()
    {
        return json_decode($this->attributes['day_delivery']);
    }

    public function setInfoDeliveryAttribute($value)
    {
        $value = is_array($value) ? $value : null;
        $this->attributes['info_delivery'] = json_encode($value, JSON_UNESCAPED_UNICODE);
    }

    public function getInfoDeliveryAttribute()
    {
        if (!$this->attributes['info_delivery']){
            return null;
        }
        return json_decode($this->attributes['info_delivery']);
    }

    public function setFilesAttribute($value)
    {
        $saving = [];
        $files = is_array($value) ? $value : [];
        foreach ($files as $file) {
            try {
                self::validateFile($file);
                array_push($saving, $file);
            } catch (\Exception $e) {
                throw $e;
            }
        }
        $this->attributes['files'] = json_encode($saving, JSON_UNESCAPED_UNICODE);
    }

    public function getFilesAttribute()
    {
        return json_decode($this->attributes['files']);
    }

    public function delete()
    {
        \DB::beginTransaction();
        try {
            $this->update(['is_deleted' => '0']);
            event(new AgentEvent('restore', $this->toArray()));
            \DB::commit();
            return $this;
        } catch (\Exception $e) {
            event(new  AgentErrorEvent($e->getMessage(), $e->getTrace()));
            \DB::rollback();
            throw $e;
        }
    }

    public function restore()
    {
        \DB::beginTransaction();
        try {
            $this->update(['is_deleted' => '1']);
            event(new AgentEvent('restore', $this->toArray()));
            \DB::commit();
            return $this;
        } catch (\Exception $e) {
            event(new  AgentErrorEvent($e->getMessage(), $e->getTrace()));
            \DB::rollback();
            throw $e;
        }
    }


    static function createNew($data)
    {
        \DB::beginTransaction();
        try {
            self::validate($data);
            $item = self::create($data);
            event(new AgentEvent('create', $data));
            \DB::commit();
            return $item;
        } catch (\Exception $e) {
            \DB::rollback();
            event(new AgentErrorEvent($e, $data));
            throw $e;
        }
    }

    public function updateExist(array $data)
    {
        \DB::beginTransaction();
        try {
            self::validate($data, false, $this->id);
            $old = $this->toArray();
            $this->fill($data);
            $changed = $this->getDirty();
            $this->update($data);
            event(new AgentEvent('change', $old, $changed));
            \DB::commit();
            return $this;
        } catch (\Exception $e) {
            \DB::rollback();
            event(new AgentErrorEvent($e, $data));
            throw $e;
        }
    }

    function updateFiles(array $files){
        \DB::beginTransaction();
        try {

            $old = $this->toArray();
            $this->fill(['files'=>$files]);
            $changed = $this->getDirty();
            $this->update(['files'=>$files]);
            event(new AgentEvent('change', $old, $changed));
            \DB::commit();
            return $this;
        } catch (\Exception $e) {
            \DB::rollback();
            event(new AgentErrorEvent($e, ['files'=>$files]));
            throw $e;
        }
    }

    public function addCompany($data)
    {
        return Company::createNewCompany($data, $this->id);
    }


    static function validate($data, $id = null)
    {
        $rules = [
            'name' => 'required',
            //'price' => 'required',
        ];
        $validator = \Validator::make($data, $rules);
        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }
    }

    static function validateFile($data)
    {
        $rules = [
            'filename' => 'required',
            'servername' => 'required',
            'key' => 'required',
        ];
        $validator = \Validator::make($data, $rules);
        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }
    }

    static function validateUpload($data)
    {
        $rules = [
            'filename' => 'required',
            'base64' => 'required',
        ];
        $validator = \Validator::make($data, $rules);
        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }
    }

    static function getAll()
    {
        return self::with('Companies')
            ->with('Companies.CompanyAccounts')
            ->where('is_deleted', 0)
            ->orderBy('name', 'ASC')->get();
    }

    static function getAgents()
    {
        return self::
            where('is_deleted', 0)->get();
    }

    static function uploadFile($data)
    {
        $answer = [];
        self::validateUpload($data);
        $answer['filename'] = ($data['filename']);
        $server_name = time() . rand(0, 1000) . '.' . pathinfo($data['filename'], PATHINFO_EXTENSION);
        $content = base64_decode($data['base64']);
        file_put_contents(public_path('uploads/agents/' . $server_name), $content);

        $answer['key'] = md5($server_name);
        $answer['serverpath'] = '/uploads/agents/' . $server_name;
        $answer['servername'] = $server_name;
        return $answer;
    }

    static function deleteUploadFile($file, $key)
    {
        $file = basename($file);
        $file = public_path('/uploads/agents/' . $file);
        if (!file_exists($file)) {
            throw new \Exception('File not found');
        }
        unlink($file);
        return true;
    }

    static function findOrDie($id)
    {
        $item = Agent::where('id', $id)->with('Companies')->first();;
        if (is_null($item)) {
            throw new \Exception('Агент не найден');
        }
        return $item;
    }

    public function updateDebt($debt){
        $this->update(['debt'=>$debt]);
    }
    static function clearDebt(){
        \DB::table('agents')
            ->update(['debt' => null]);
    }
}

