<?php
require_once __DIR__.'/database.php';
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
function user(): ?array { return $_SESSION['user'] ?? null; }
function require_login(): void { if (!user()) { header('Location: '.BASE_URL.'/login.php'); exit; } }
function require_admin(): void { require_login(); if ((user()['role'] ?? '') !== 'admin') { http_response_code(403); exit('Acceso no autorizado'); } }
function login_user(array $u): void { session_regenerate_id(true); $_SESSION['user'] = ['id'=>(int)$u['id'],'name'=>$u['name'],'email'=>$u['email'],'role'=>$u['role']]; }
function logout_user(): void { $_SESSION=[]; if (ini_get('session.use_cookies')) { $p=session_get_cookie_params(); setcookie(session_name(),'',time()-42000,$p['path'],$p['domain']??'',$p['secure'],$p['httponly']); } session_destroy(); }
