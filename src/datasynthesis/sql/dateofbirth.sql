SELECT a.age, a.dateofbirthdate as dob
FROM datagenerated_dateofbirth as a
WHERE a.statusid=1 AND random() < 0.01
LIMIT 1
