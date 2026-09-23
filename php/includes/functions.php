<?php
function e(?string $v): string { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); }
function redirect(string $path): never { header('Location: '.BASE_URL.'/'.$path); exit; }
function flash(string $type,string $message): void { $_SESSION['flash']=[$type,$message]; }
function consume_flash(): ?array { $f=$_SESSION['flash']??null; unset($_SESSION['flash']); return $f; }
