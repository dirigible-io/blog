/* globals $ */
/* eslint-env node, dirigible */

var ioLib = require('io');
var entityLib = require('entity');

// create entity by parsing JSON object from request body
exports.createBlog = function() {
    var input = ioLib.read($.getRequest().getInputStream());
    var requestBody = JSON.parse(input);
    var connection = $.getDatasource().getConnection();
    try {
        var sql = "INSERT INTO BLOG (";
        sql += "TOPIC_ID";
        sql += ",";
        sql += "TOPIC_USER";
        sql += ",";
        sql += "TOPIC_NAME";
        sql += ",";
        sql += "TOPIC_CONTENT";
        sql += ") VALUES ("; 
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ",";
        sql += "?";
        sql += ")";

        var statement = connection.prepareStatement(sql);
        var i = 0;
        var id = $.getDatabaseUtils().getNext('BLOG_TOPIC_ID');
        statement.setInt(++i, id);
        statement.setString(++i, requestBody.topic_user);
        statement.setString(++i, requestBody.topic_name);
        statement.setString(++i, requestBody.topic_content);
        statement.executeUpdate();
		$.getResponse().getWriter().println(id);
        return id;
    } catch(e) {
        var errorCode = $.getResponse().SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
    return -1;
};

// read single entity by id and print as JSON object to response
exports.readBlogEntity = function(id) {
    var connection = $.getDatasource().getConnection();
    try {
        var result;
        var sql = "SELECT * FROM BLOG WHERE " + exports.pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setInt(1, id);
        
        var resultSet = statement.executeQuery();
        if (resultSet.next()) {
            result = createEntity(resultSet);
        } else {
        	entityLib.printError($.getResponse().SC_NOT_FOUND, 1, "Record with id: " + id + " does not exist.", sql);
        }
        var jsonResponse = JSON.stringify(result, null, 2);
        $.getResponse().getWriter().println(jsonResponse);
    } catch(e){
        var errorCode = $.getResponse().SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

// read all entities and print them as JSON array to response
exports.readBlogList = function(limit, offset, sort, desc) {
    var connection = $.getDatasource().getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + $.getDatabaseUtils().createTopAndStart(limit, offset);
        }
        sql += " * FROM BLOG";
        if (sort !== null) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== null && desc !== null) {
            sql += " DESC ";
        }
        if (limit !== null && offset !== null) {
            sql += " " + $.getDatabaseUtils().createLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
        var jsonResponse = JSON.stringify(result, null, 2);
        $.getResponse().getWriter().println(jsonResponse);
    } catch(e){
        var errorCode = $.getResponse().SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

//create entity as JSON object from ResultSet current Row
function createEntity(resultSet) {
    var result = {};
	result.topic_id = resultSet.getInt("TOPIC_ID");
    result.topic_user = resultSet.getString("TOPIC_USER");
    result.topic_name = resultSet.getString("TOPIC_NAME");
    result.topic_content = resultSet.getString("TOPIC_CONTENT");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
}

// update entity by id
exports.updateBlog = function() {
    var input = ioLib.read($.getRequest().getInputStream());
    var responseBody = JSON.parse(input);
    var connection = $.getDatasource().getConnection();
    try {
        var sql = "UPDATE BLOG SET ";
        sql += "TOPIC_USER = ?";
        sql += ",";
        sql += "TOPIC_NAME = ?";
        sql += ",";
        sql += "TOPIC_CONTENT = ?";
        sql += " WHERE TOPIC_ID = ?";
        var statement = connection.prepareStatement(sql);
        var i = 0;
        statement.setString(++i, responseBody.topic_user);
        statement.setString(++i, responseBody.topic_name);
        statement.setString(++i, responseBody.topic_content);
        var id = responseBody.topic_id;
        statement.setInt(++i, id);
        statement.executeUpdate();
		$.getResponse().getWriter().println(id);
    } catch(e){
        var errorCode = $.getResponse().SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

// delete entity
exports.deleteBlog = function(id) {
    var connection = $.getDatasource().getConnection();
    try {
    	var sql = "DELETE FROM BLOG WHERE " + exports.pkToSQL();
        var statement = connection.prepareStatement(sql);
        statement.setString(1, id);
        statement.executeUpdate();
        $.getResponse().getWriter().println(id);
    } catch(e){
        var errorCode = $.getResponse().SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
};

exports.countBlog = function() {
    var count = 0;
    var connection = $.getDatasource().getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM BLOG';
        var statement = connection.createStatement();
        var rs = statement.executeQuery(sql);
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e){
        var errorCode = $.getResponse().SC_BAD_REQUEST;
        entityLib.printError(errorCode, errorCode, e.message, sql);
    } finally {
        connection.close();
    }
    $.getResponse().getWriter().println(count);
};

exports.metadataBlog = function() {
	var entityMetadata = {
		name: 'blog',
		type: 'object',
		properties: []
	};
	
	var propertytopic_id = {
		name: 'topic_id',
		type: 'integer',
	key: 'true',
	required: 'true'
	};
    entityMetadata.properties.push(propertytopic_id);

	var propertytopic_user = {
		name: 'topic_user',
		type: 'string'
	};
    entityMetadata.properties.push(propertytopic_user);

	var propertytopic_name = {
		name: 'topic_name',
		type: 'string'
	};
    entityMetadata.properties.push(propertytopic_name);

	var propertytopic_content = {
		name: 'topic_content',
		type: 'string'
	};
    entityMetadata.properties.push(propertytopic_content);


	$.getResponse().getWriter().println(JSON.stringify(entityMetadata));
};

exports.getPrimaryKeys = function() {
    var result = [];
    var i = 0;
    result[i++] = 'TOPIC_ID';
    if (result === 0) {
        throw $.getExceptionUtils().createException("There is no primary key");
    } else if(result.length > 1) {
        throw $.getExceptionUtils().createException("More than one Primary Key is not supported.");
    }
    return result;
};

exports.getPrimaryKey = function() {
	return exports.getPrimaryKeys()[0].toLowerCase();
};

exports.pkToSQL = function() {
    var pks = exports.getPrimaryKeys();
    return pks[0] + " = ?";
};
