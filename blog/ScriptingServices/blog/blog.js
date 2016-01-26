/* globals $ */
/* eslint-env node, dirigible */

var entityLib = require('entity');
var entityBlog = require('blog/blog_lib');

handleRequest();

function handleRequest() {
	
	$.getResponse().setContentType("application/json; charset=UTF-8");
	$.getResponse().setCharacterEncoding("UTF-8");
	
	// get method type
	var method = $.getRequest().getMethod();
	method = method.toUpperCase();
	
	//get primary keys (one primary key is supported!)
	var idParameter = entityBlog.getPrimaryKey();
	
	// retrieve the id as parameter if exist 
	var id = $.getXssUtils().escapeSql($.getRequest().getParameter(idParameter));
	var count = $.getXssUtils().escapeSql($.getRequest().getParameter('count'));
	var metadata = $.getXssUtils().escapeSql($.getRequest().getParameter('metadata'));
	var sort = $.getXssUtils().escapeSql($.getRequest().getParameter('sort'));
	var limit = $.getXssUtils().escapeSql($.getRequest().getParameter('limit'));
	var offset = $.getXssUtils().escapeSql($.getRequest().getParameter('offset'));
	var desc = $.getXssUtils().escapeSql($.getRequest().getParameter('desc'));
	
	if (limit === null) {
		limit = 100;
	}
	if (offset === null) {
		offset = 0;
	}
	
	if(!entityLib.hasConflictingParameters(id, count, metadata)) {
		// switch based on method type
		if ((method === 'POST')) {
			// create
			entityBlog.createBlog();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				entityBlog.readBlogEntity(id);
			} else if (count !== null) {
				entityBlog.countBlog();
			} else if (metadata !== null) {
				entityBlog.metadataBlog();
			} else {
				entityBlog.readBlogList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			entityBlog.updateBlog();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityLib.isInputParameterValid(idParameter)){
				entityBlog.deleteBlog(id);
			}
		} else {
			entityLib.printError($.getResponse().SC_BAD_REQUEST, 1, "Invalid HTTP Method", method);
		}
	}
	
	// flush and close the response
	$.getResponse().getWriter().flush();
	$.getResponse().getWriter().close();
}
