<html>
<head>
	<title>CS242 Portfolio</title>
</head>
<body>
	<p>Hey world</p>
    <?php
    if (file_exists('svn_log.xml')) {
        $log = simplexml_load_file('svn_log.xml');

        print_r($log);
    } else {
        exit('Failed to open svn_log.xml');
    }
    if (file_exists('svn_list.xml')) {
            $list = simplexml_load_file('svn_list.xml');

            print_r($list);
    } else {
        exit('Failed to open svn_list.xml');
    }
    ?>
</body>
</html>