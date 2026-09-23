<?php
require_once __DIR__.'/database.php';
function current_user(): ?array { return $_SESSION['user'] ?? null; }
function require_login(): array { $user=current_user(); if (!$user) { $target=basename($_SERVER['PHP_SELF']); header('Location: login.php?redirect='.urlencode($target)); exit; } return $user; }
function require_admin(): array { $user=require_login(); if (($user['role'] ?? '') !== 'admin') { redirect('index.php'); } return $user; }
function login_user(array $user): void { session_regenerate_id(true); $_SESSION['user']=['id'=>(int)$user['id'],'name'=>$user['name'],'email'=>$user['email'],'role'=>$user['role']]; }
