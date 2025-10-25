<?php
require "Connection.php";
class Gomeet
{
    private $dating;

    public function __construct($dating)
    {
        $this->dating = $dating;
    }
    
    public function datinglogin($username, $password, $tblname)
    {
        
        if($tblname == 'admin')
		{
            $q = "SELECT * FROM " . $this->dating->real_escape_string($tblname) . " WHERE username='" . $this->dating->real_escape_string($username) . "' AND password='" . $this->dating->real_escape_string($password) . "'";
            $result = $this->dating->query($q);
            return $result ? $result->num_rows : 0;
        }
		else 
		{
			$q = "SELECT * FROM " . $this->dating->real_escape_string($tblname) . " WHERE email='" . $this->dating->real_escape_string($username) . "' AND password='" . $this->dating->real_escape_string($password) . "'";
            $result = $this->dating->query($q);
            return $result ? $result->num_rows : 0;
		}
    }
    
   
    public function datinginsertdata($field_values, $data_values, $table)
    {
        if (count($field_values) !== count($data_values)) {
            return 0; 
        }
        $fields = implode(', ', array_map([$this->dating, 'real_escape_string'], $field_values));
        $placeholders = str_repeat('?, ', count($data_values) - 1) . '?';
        $sql = "INSERT INTO " . $this->dating->real_escape_string($table) . " ($fields) VALUES ($placeholders)";
        
        $stmt = $this->dating->prepare($sql);
        if (!$stmt) {
            return 0;
        }
        
        $types = str_repeat('s', count($data_values));  
        $stmt->bind_param($types, ...$data_values);
        
        if ($stmt->execute()) {
            return 1;
        }
        return 0;
    }
    
    
    public function datingupdateData($field, $table, $where)
    {
        $setParts = [];
        $types = '';
        $params = [];
        
        foreach ($field as $key => $value) {
            $setParts[] = $this->dating->real_escape_string($key) . " = ?";
            $types .= 's';
            $params[] = $value;
        }
        
        $setClause = implode(', ', $setParts);
        $sql = "UPDATE " . $this->dating->real_escape_string($table) . " SET $setClause $where";
        
        $stmt = $this->dating->prepare($sql);
        if (!$stmt) {
            return 0;
        }
        
        $stmt->bind_param($types, ...$params);
        
        if ($stmt->execute()) {
            return $stmt->affected_rows > 0 ? 1 : 0;  
        }
        return 0;
    }
    
    
    public function datingupdateData_single($field, $table, $where)
    {
        
        $sql = "UPDATE " . $this->dating->real_escape_string($table) . " SET " . $field . " " . $where;
        if ($this->dating->query($sql)) {
            return $this->dating->affected_rows > 0 ? 1 : 0;
        }
        return 0;
    }

}
?>