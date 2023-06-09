import React, {ChangeEvent, FormEvent, useState} from 'react';
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import Button from "@/components/Button";
import {colors} from "@/utils/ColorsUtils";
import {FormStateType} from "@/utils/type";

const availableAreas: string[] = ["< 50 m²", "50 - 100 m²", "> 100 m²"];
const availableDomains: string[] = ["Façades", "Terrasses", "Toitures"];

type FormProps = {
    size: "small" | "medium" | undefined,
    selectColor?: string,
    color?: string,
    domain?: "Façades" | "Terrasses" | "Toitures",
}

type ErrorState = {
    name: boolean,
    email: boolean,
    alreadySent: boolean,
    apiError: boolean,
    apiErrorMessage: "Une erreur est survenue, veuillez réessayer plus tard" | "Votre demande a bien été envoyée" | undefined,
    apiLoading: boolean,
}

const Form = (props: FormProps) => {
    const [form, setForm] = useState<FormStateType>({
        name: "",
        email: "",
        phone: "",
        area: "",
        domain: props.domain ? props.domain : "",
        message: "",
    });

    const [errors, setErrors] = useState<ErrorState>({
        name: false,
        email: false,
        alreadySent: false,
        apiError: false,
        apiErrorMessage: undefined,
        apiLoading: false,
    });

    const handleChange = (event: FormChangeEvent) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setErrors({
            name: isVoid(form.name),
            email: isVoid(form.email),
            alreadySent: false,
            apiError: false,
            apiErrorMessage: undefined,
            apiLoading: true,
        });

        if (isVoid(form.name) || isVoid(form.email)) return;

        if(isAlreadySent()){
            setErrors({
                ...errors,
                alreadySent: true,
            });
            return;
        }
        sendMessage();
    }

    const setFormVoid = (): void => {
        setForm({
            name: "",
            email: "",
            phone: "",
            area: "",
            domain: "",
            message: "",
        });
    }

    const isVoid = (value: string): boolean => {
        return value === "";
    }

    const setMessageAlreadySent = (): void => {
        localStorage.setItem("alreadySent", String(Date.now()));
    }

    function isAlreadySent(): boolean {
        const alreadySent = localStorage.getItem("alreadySent");
        if(alreadySent !== null && Date.now() - Number(alreadySent) > 86400000) {
            localStorage.removeItem("alreadySent");
            return false;
        }
        return alreadySent !== null;
    }

    const sendMessage = (): void => {
        fetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
        })
            .then((response) => {

                if (response.status !== 200) {
                    setErrors({
                        ...errors,
                        apiError: true,
                        apiErrorMessage: "Une erreur est survenue, veuillez réessayer plus tard"
                    })
                    return;
                }
                setErrors({
                    ...errors,
                    apiError: false,
                    apiErrorMessage: "Votre demande a bien été envoyée",
                    apiLoading: false,
                })
                setFormVoid();
                setMessageAlreadySent();

            });
    }

    type FormChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent;

    return (
        <form className="flex flex-col justify-around w-full space-y-5" onSubmit={handleSubmit}>
            <div className="flex justify-between">
                <TextField
                    error={errors.name}
                    helperText={errors.name && "Ce champ est obligatoire"}
                    value={form.name}
                    onChange={handleChange}
                    name="name"
                    label="Nom"
                    size={props.size}
                    sx={{width: "45%"}}/>
                <TextField
                    value={form.phone}
                    onChange={handleChange}
                    name="phone"
                    label="Téléphone"
                    size={props.size}
                    sx={{width: "45%"}}/>
            </div>
            <TextField
                error={errors.email}
                helperText={errors.email && "Entrez un email correct"}
                value={form.email}
                onChange={handleChange}
                name="email"
                type="email"
                label="Adresse email"
                size={props.size}/>
            <div className="flex justify-between w-full">
                <FormControl size={props.size} sx={{width: "45%"}}>
                    <InputLabel id="area">Superficie</InputLabel>
                    <Select
                        labelId="area"
                        value={form.area}
                        onChange={handleChange}
                        name="area"
                        label="Superficie">
                        {availableAreas.map((area, index) => (
                            <MenuItem key={index} value={area}>{area}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size={props.size} sx={{width: "45%"}}>
                    <InputLabel id="domain">Domaine</InputLabel>
                    <Select
                        labelId="domain"
                        value={form.domain}
                        onChange={handleChange}
                        name="domain"
                        label="domaine">
                        {availableDomains.map((domain, index) => (
                            <MenuItem key={index} value={domain}>{domain}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <TextField
                id="message"
                value={form.message}
                onChange={handleChange}
                name="message"
                label="Message"
                size={props.size}
                inputProps={{style: {height: "150px"}}}
                multiline/>

            <Button type="submit"
                    backgroundColor={errors.apiLoading ? colors.lightGrey : colors.main}
                    hoverBackgroundColor={colors.lightGrey}
                    fontColor={colors.white}
                    disabled={errors.apiLoading}>
                {errors.apiLoading ? "Envoi en cours..." : "Envoyer"}
            </Button>
            {errors.alreadySent ?
                <p className="text-center text-red-500">Vous avez déjà envoyé un message, contactez-nous par téléphone
                    pour plus d'information</p> : null}
            {errors.apiErrorMessage && !errors.alreadySent ?
                <p className={"text-center " + (errors.apiError ? "text-red-500" : "text-green-600")}>
                    {errors.apiErrorMessage}</p> : null}
        </form>
    );
}

export default Form;