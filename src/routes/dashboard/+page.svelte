<script lang="ts">
	let { data } = $props();
</script>

<h1>Welcome {data.user.username}!</h1>
<form method="POST" action="/accounts/logout">
	<button>Logout</button>
</form>
