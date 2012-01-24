/**
 * @author James White
 */

var app = (function (safe){
	var bus = (function (){
		var listeners = [];
		var data = {
			global : []
		};
		var wire = function (name, cb, type){
			var t = type || 'all';
			if (name in data){
				data[name][t].push(cb);
			}
			else{
				if (t === 'all' || t ==='once'){
					data[name] = {
						all : [],
						once : []
					};
					data[name][t].push(cb);
				}
				else if (t === 'listener'){
					listeners.push(function (){
						return {
							name : name,
							cb : cb
						};
					});
				}
			}
		};
		
		var fire = function(name, args){
			if (name in data){
				while(data[name].once.length > 0){
					var once = data[name].once.shift();
					once();
				}
				$.each(data[name]['all'], function (i, fn){ fn.call(this, args); });
				$.each(listeners, function (i, listener){ listener.cb.call(listener, name, args); });
			}
		};
		
		return {
			wire : wire,
			fire : fire
		};
	})(),
	
	splitController = (function (bus){
		var obj = {
			events : function (){
				bus.wire('eval-split', obj.eval);
				bus.wire('render-split', obj.render);
			},
			init : function (){
				$("#body-content-tmpl").mustache()
				$("#split-content").append(
					$("#body-content-tmpl").mustache({
						name: 'Split',
						id: 'eval-split',
						text: 'split-text',
						expr: 'split-expr',
						results: 'split-results'
				}));
				$("#eval-split").live('click', function(){ bus.fire('eval-split'); });
				obj.events();
			},
			eval : function (){
				var text = $('#split-text').val(),
					exprStr = $("#split-expr").val(),
					expr = new RegExp(exprStr),
					results = text.split(expr);
					
				bus.fire('render-split', results);
			},
			render : function (results){
				$("#split-results").empty();
				var k = {data : $.map(results, function (v){ return {value: v}; }) };
				$("#split-results").append($("#result-tmpl").mustache(k));
			}
		};
		return obj;
	})(bus),
	
	matchController = (function (safe, bus){
		var obj = {
			events : function (){
				bus.wire('eval-match', obj.eval);
				bus.wire('render-match', obj.render);
			},
			init : function (){
				$("#match-content").append(
					$("#body-content-tmpl").mustache({
						name: 'Match',
						id: 'match-split',
						text: 'match-text',
						expr: 'match-expr',
						results: 'match-results'
				}));
				$("#eval-match").live('click', function (){
					bus.fire('eval-match');
				});
			},
			eval : function (){
				bus.fire('render-match');
			},
			render : function (){
				
			}
		};		
		return obj;
	})(safe, bus),
	
	replaceController = (function (safe, bus){
		var pub = {
			events: function (){
				bus.wire('eval-replace', obj.eval);
				bus.wire('render-replace', obj.render);
			},
			init : function (){
				$("#replace-content").append(
					$("#body-content-tmpl").mustache({
						name: 'Replace',
						id: 'replace-split',
						text: 'replace-text',
						expr: 'replace-expr',
						results: 'replace-results'
				}));
				$("#replace-match").live('click', function (){
					bus.fire('replace-match');
				});
			},
			eval : function (){
				bus.fire('render-replace');
			},
			render : function (){
				
			}
		};
		return pub;
	})(safe, bus),
	
	mainController = (function (safe, bus, controllers){
		return {
			events : function (){
				bus.wire('clear-text', this.clear);
			},
			clear : function (){
				$("input").val();
			},
			init : function (){
				var tmpl = $("#navigation-tmpl").mustache();
				$(".content-secondary").append(tmpl);
				
				$(".clear-text").live('click', function (){ bus.fire('clear-text');	});
				$.each(controllers, function (i, controller){
					controller.init();
				});
			}
		};
	})(safe, bus, [splitController, matchController, replaceController]);
	
	return {
		bus : bus,
		controllers : [mainController, splitController, matchController, replaceController],
		init : mainController.init
	};
})(safe).init();


