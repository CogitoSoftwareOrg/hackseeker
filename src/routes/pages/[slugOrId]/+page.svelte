<script lang="ts">
	import { onMount } from 'svelte';

	import { Collections, pb } from '$lib';

	let { data } = $props();

	let isSubmitting = $state(false);
	let formSubmitted = $state(false);

	async function submitLeadForm(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const contact = formData.get('contact') as string;

		isSubmitting = true;
		try {
			await pb.collection(Collections.Leads).create({ contact, pain: data.painId, payload: {} });
			formSubmitted = true;
			// Update success message visibility
			const successEls = document.querySelectorAll('[data-form-success]');
			const formEls = document.querySelectorAll('[data-lead-form]');
			if (successEls) successEls.forEach((el) => el.classList.remove('hidden'));
			if (formEls) formEls.forEach((el) => el.classList.add('hidden'));
		} catch (error) {
			console.error(error);
		} finally {
			isSubmitting = false;
		}
	}

	onMount(() => {
		const leadForms = document.querySelectorAll('[data-lead-form]');
		leadForms.forEach((form) => {
			form.addEventListener('submit', submitLeadForm);
		});
	});
</script>

{@html data.htmlContent}
