const colors = ["red", "black"];

class Player {
	constructor(id, name, color) {
		this.id = id;
		this.name = name;
		this.color = color;
	}
}

$(function(){
	var p1, p2, current_player;
	$(window).on("load", function() { initGame(); });
	$('#newgame').on('click', function() { location.reload(); });
	$('#optMenu').on('click', function() { initOptions(); });
	$('.btn-save').on('click', function() { saveOptions(); });
});

function initGame() {
	if (localStorage.getItem("mode") == null) localStorage.setItem("mode", 1);
	if (localStorage.getItem("color") == null) localStorage.setItem("color", 1);
	if (localStorage.getItem("p1name") == null) localStorage.setItem("p1name", "Player 1");
	if (localStorage.getItem("p2name") == null) localStorage.setItem("p2name", "Player 2");
	
	$.each([1,2,3,4,5,6,7,8], function(index, value) {
		$('.table').append('<div class="row r' + value + '"></div>');
		$.each([1,2,3,4,5,6,7,8], function(index2, value2) {
			$('.row.r' + value).append('<div id="pos' + value + 'x' + value2 + '"></div>');
		});
	});
	
	$player_color = Math.floor(Math.random() * 2) + 2;
	if (localStorage.getItem("color") != 1) $player_color = localStorage.getItem("color");
	p1 = new Player(1, localStorage.getItem("p1name"), colors[$player_color - 2]);
	p2 = new Player(2, localStorage.getItem("p2name"), colors[3 - $player_color]);
	
	$('#p1text').text(p1.name);
	$('#p2text').text(p2.name);
	
	//add pieces to player1
	$('.row.r1, .row.r3').find('div:odd').append('<span class="piece ' + p1.color + '"></span>');
	$('.row.r2').find('div:even').append('<span class="piece ' + p1.color + '"></span>');
	
	//add pieces to player2
	$('.row.r6, .row.r8').find('div:even').append('<span class="piece ' + p2.color + '"></span>');
	$('.row.r7').find('div:odd').append('<span class="piece ' + p2.color + '"></span>');	
	
	$rand01 = Math.floor(Math.random() * 2);
	current_player = $rand01 == 0?p1:p2;
	$('#message-box span').text('Player' + current_player.id + ' starts');
	setTimeout(function(){$('#message-box span').text('Click the piece you want to move.');}, 1000);
	
	$(document).on('click', 'div.move', function(){
		movePiece($(this));
	});
	
	startGame();
}

function startGame() {	
	$('#game-board').find('*').prop("onclick", null).off("click");
	
	if ($('span.piece.' + current_player.color + '.active').length == 0) focusPieces();
	
	$('span.piece:not(current_player.color)').on('click', function() {
		$('#message-box span').text('This is not your piece!');
	});
	
	$('span.piece.' + current_player.color + ':not(active)').on('click', function() {
		$('#message-box span').text('There are no available moves for this piece!');
		focusPieces();
		clearMoves();
	});
	
	$('.row:nth-child(even) div:nth-child(even), .row:nth-child(odd) div:nth-child(odd)').on('click', function(){
		$('#message-box span').text("The light squares aren't used in this game");
	});
	
	
	$('span.piece.active').on('click', function() {
		$('span.piece.active').removeClass('active');
		$('span.piece.selected').removeClass('selected');
		clearMoves()
		$(this).addClass('selected');
		$('#message-box span').text('Now click the square you want to move to.');
		$.each(calcMoves($(this).parent().attr('id')), function(index, value) {
			$(value).addClass('move');
		});
		
		$('.row:nth-child(even) div:nth-child(odd), .row:nth-child(odd) div:nth-child(even)').filter(function() { return $(this).is(':empty') && !$(this).hasClass('move'); }).prop("onclick", null).off("click");
		$('.row:nth-child(even) div:nth-child(odd), .row:nth-child(odd) div:nth-child(even)').filter(function() { return $(this).is(':empty') && !$(this).hasClass('move'); }).on('click', function() {
			if ($('#message-box span').text() == "You can't move to this square.") {
				$('#message-box span').text("Can't move to this one either!");
			} else {
				$('#message-box span').text("You can't move to this square.");
			}
		});
	});
}

function calcMoves(pos) {
	$ids = []
	$moves_lst = [1,2];
	if ($('#'+pos).children().hasClass('king')) $moves_lst = [1,2,-1,-2];
	$current_row = parseInt(pos[3]);
	$current_col = parseInt(pos[5]);
	
	$.each($moves_lst, function(index, value) {
		$lookup_row = $current_row + value*(current_player.id == 1?1:-1);
		$lookup_col_1 = $current_col - value;
		$lookup_col_2 = $current_col + value;
		switch (index) {
			case 0:
				if (is1x8($lookup_row) && is1x8($lookup_col_1) && $('#pos' + $lookup_row + 'x' + $lookup_col_1).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_1);
				if (is1x8($lookup_row) && is1x8($lookup_col_2) && $('#pos' + $lookup_row + 'x' + $lookup_col_2).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_2);
				break;
			case 1:
				if (is1x8($lookup_row) && is1x8($lookup_col_1) && $('#pos' + ($lookup_row + (current_player.id == 1?-1:1)) + 'x' + ($lookup_col_1 + 1)).children().hasClass(current_player.color == 'red'?'black':'red') && $('#pos' + $lookup_row + 'x' + $lookup_col_1).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_1);
				if (is1x8($lookup_row) && is1x8($lookup_col_2) && $('#pos' + ($lookup_row + (current_player.id == 1?-1:1)) + 'x' + ($lookup_col_2 - 1)).children().hasClass(current_player.color == 'red'?'black':'red') && $('#pos' + $lookup_row + 'x' + $lookup_col_2).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_2);
				break;
			case 2:
				if (is1x8($lookup_row) && is1x8($lookup_col_1) && $('#pos' + $lookup_row + 'x' + $lookup_col_1).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_1);
				if (is1x8($lookup_row) && is1x8($lookup_col_2) && $('#pos' + $lookup_row + 'x' + $lookup_col_2).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_2);
				break;
			case 3:
				if (is1x8($lookup_row) && is1x8($lookup_col_1) && $('#pos' + ($lookup_row + (current_player.id == 1?1:-1)) + 'x' + ($lookup_col_1 - 1)).children().hasClass(current_player.color == 'red'?'black':'red') && $('#pos' + $lookup_row + 'x' + $lookup_col_1).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_1);
				if (is1x8($lookup_row) && is1x8($lookup_col_2) && $('#pos' + ($lookup_row + (current_player.id == 1?1:-1)) + 'x' + ($lookup_col_2 + 1)).children().hasClass(current_player.color == 'red'?'black':'red') && $('#pos' + $lookup_row + 'x' + $lookup_col_2).is(':empty')) $ids.push('#pos' + $lookup_row + 'x' + $lookup_col_2);
				break;
		}
	});
	return $ids;
}

function focusPieces() {
	$('span.piece.' + current_player.color).each(function() {
		if (calcMoves($(this).parent().attr('id'), current_player.id).length > 0) $(this).removeClass('selected').addClass('active');
	});
	if ($('span.active').length == 0) setTimeout(function(){alert("Game over! Player" + (3-current_player.id) + "won.");}, 1000); //todo
}

function clearMoves() {
	$('div.move').removeClass('move');
}

function movePiece(piece) {
	clearMoves();
	if (Math.abs(piece.index() - $('span.piece.selected').parent().index()) == 2) removePiece($('span.piece.selected').parent().attr('id'), piece.attr('id'));
	if ((piece.attr('id').indexOf('8x') >= 0 && current_player.id == 1) || (piece.attr('id').indexOf('1x') >= 0 && current_player.id == 2)) $('span.piece.selected').addClass('king');
	piece.append($('span.piece.selected').removeClass('selected'));
	$('#message-box span').text('Player' + current_player.id + ' moved to ' + piece.attr('id'));
	setTimeout(function(){$('#message-box span').text('Click the piece you want to move.');}, 1000);
	current_player = current_player.id == 1?p2:p1;
	startGame();	
}

function removePiece(a, b) {
	var p = "#pos";
	var opposite_direction = (current_player.id == 1 ? parseInt(b[3]) - parseInt(a[3]) < 0 : parseInt(a[3]) - parseInt(b[3]) < 0);
	if (!opposite_direction) p = p + (parseInt(b[3]) + (current_player.id == 1?-1:1)) + "x" + (parseInt(b[5]) > parseInt(a[5])?(parseInt(b[5]) - 1):(parseInt(b[5]) + 1));
	if (opposite_direction) p = p + (parseInt(b[3]) + (current_player.id == 1?1:-1)) + "x" + (parseInt(b[5]) > parseInt(a[5])?(parseInt(b[5]) - 1):(parseInt(b[5]) + 1));
	$(p).html('');
}

function is1x8(n) {
	return n >= 1 && n <= 8;
}

function initOptions() {
	if (localStorage.getItem("mode") == 1) $('#modeM').prop("checked", true);
	if (localStorage.getItem("mode") == 2) $('#modeC').prop("checked", true);
	
	if (localStorage.getItem("color") == 1) $('#color-1').prop("checked", true);
	if (localStorage.getItem("color") == 2) $('#color-2').prop("checked", true);
	if (localStorage.getItem("color") == 3) $('#color-3').prop("checked", true);
	
	if (localStorage.getItem("p1name")) $('#p1Name').val(localStorage.getItem("p1name"));
	if (localStorage.getItem("p2name")) $('#p2Name').val(localStorage.getItem("p2name"));
	
	$('#modeC, #modeM').on('click', function() {
		if ($('#modeC').is(':checked')) {
			var computer = ['Mike', 'Bill', 'Lisa', 'John', 'Alex', 'Kate']
			$('#p2Name').val(computer[Math.floor(Math.random() * computer.length)]).attr('disabled', true);
		} else {
			$('#p2Name').val('Player 2').attr('disabled', false);
		}
	});
}

function saveOptions() {
	if ($('#modeM').is(':checked')) localStorage.setItem("mode", 1);
	if ($('#modeC').is(':checked')) localStorage.setItem("mode", 2);
	
	if ($('#color-1').is(':checked')) localStorage.setItem("color", 1);
	if ($('#color-2').is(':checked')) localStorage.setItem("color", 2);
	if ($('#color-3').is(':checked')) localStorage.setItem("color", 3);
	$player_color = Math.floor(Math.random() * 2) + 2;
	if (localStorage.getItem("color") != 1) $player_color = localStorage.getItem("color");
	var p1_old_color = p1.color;
	p1.color = colors[$player_color - 2];
	p2.color = colors[3 - $player_color];
	
	if ($('#p1Name').val() != "") localStorage.setItem("p1name", $('#p1Name').val());
	if ($('#p2Name').val() != "") localStorage.setItem("p2name", $('#p2Name').val());
	
	p1.name = localStorage.getItem("p1name");
	p2.name = localStorage.getItem("p2name");
	
	refreshUI(p1_old_color);
}

function refreshUI(c) {
	$('#p1text').text(p1.name);
	$('#p2text').text(p2.name);
	
	var p1pieces = $('span.piece.' + c);
	$('span.piece:not(' + c + ')').removeClass(c == 'red'?'black':'red').addClass(p2.color);
	p1pieces.removeClass(c).addClass(p1.color);
}


