'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { TermsAndConditions } from './terms-and-conditions';
import { Progress } from './ui/progress';

const personalInfoSchema = z.object({
  name: z.string().min(2, { message: 'Naam is verplicht.' }),
  email: z.string().email({ message: 'Voer een geldig e-mailadres in.' }),
  phone: z.string().min(10, { message: 'Telefoonnummer is verplicht.' }),
  bsn: z.string().min(8, { message: 'Een geldig BSN is nodig voor de verzekering.' }),
  insurance: z.string().min(3, { message: 'Naam verzekeraar is nodig.' }),
  address: z.string().min(5, { message: 'Adres is nodig voor de administratie.' }),
});

const dietIntakeSchema = z.object({
  reason: z.array(z.string()).min(1, 'Kies ten minste één reden.'),
  height: z.string().regex(/^\d+$/, { message: 'Voer uw lengte in centimeters in.' }),
  weight: z.string().regex(/^\d+$/, { message: 'Voer uw gewicht in kilograms in.' }),
  weightChange: z.string({ required_error: 'Kies een optie.' }),
  exercise: z.string({ required_error: 'Kies een optie.' }),
  eatingPattern: z.array(z.string()).min(1, 'Beschrijf uw eetpatroon.'),
  fruitAndVeg: z.string({ required_error: 'Kies een optie.' }),
  sugaryDrinks: z.string({ required_error: 'Kies een optie.' }),
  healthConditions: z.array(z.string()),
  medication: z.string(),
  medicationDetails: z.string().optional(),
  treatmentGoals: z.array(z.string()),
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type DietIntake = z.infer<typeof dietIntakeSchema>;

const calculateBmi = (height: string, weight: string) => {
  const h = parseInt(height) / 100;
  const w = parseInt(weight);
  if (h > 0 && w > 0) {
    return (w / (h * h)).toFixed(1);
  }
  return null;
};

const totalSteps = 3;
const motivationalTexts = [
  'U bent goed op weg!',
  'Bijna klaar, deze informatie helpt uw diëtist enorm.',
  'Klaar! Bedankt voor het invullen.'
];


const IntakeForm = () => {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PersonalInfo & DietIntake>>({});
  const [termsAgreed, setTermsAgreed] = useState(false);

  const progress = (step / totalSteps) * 100;

  const personalInfoForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      bsn: '',
      insurance: '',
      address: '',
    },
  });

  const dietIntakeForm = useForm<DietIntake>({
    resolver: zodResolver(dietIntakeSchema),
    defaultValues: {
      reason: [],
      height: '',
      weight: '',
      weightChange: '',
      exercise: '',
      eatingPattern: [],
      fruitAndVeg: '',
      sugaryDrinks: '',
      healthConditions: [],
      medication: 'Nee',
      medicationDetails: '',
      treatmentGoals: [],
    },
  });

  const handleNextStep = (data: PersonalInfo | DietIntake) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };
  
  const handleFinalSubmit = () => {
    // Combine final form data
    const finalData = { ...formData, ...dietIntakeForm.getValues() };
    setFormData(finalData);

    console.log('Volledig intakeformulier verzonden:', finalData);
    toast({
      title: 'Aanvraag succesvol verzonden!',
      description: 'We nemen zo snel mogelijk contact met u op.',
    });
    // Reset state and redirect or show success message
    setStep(4); // Show a final confirmation view
  };


  const serviceTitle = service === 'ergotherapie' ? 'Ergotherapie' : 'Diëtetiek';

  if (step === 4) {
    return (
        <Card className="max-w-2xl mx-auto text-center p-8">
            <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary">Bedankt!</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Uw intakeformulier is succesvol verzonden. De zorgverlener neemt binnen enkele werkdagen contact met u op om een afspraak in te plannen.</p>
                <Button onClick={() => window.location.href = '/'} className="mt-6">Terug naar de homepagina</Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="mb-4">
            <div className='flex justify-between items-center mb-2'>
                <p className='text-sm text-muted-foreground'>Stap {step} van {totalSteps}</p>
                <p className='text-sm font-semibold text-primary'>{motivationalTexts[step-1]}</p>
            </div>
            <Progress value={progress} />
        </div>
        <CardTitle className="text-2xl md:text-3xl font-headline">
          Intake voor {serviceTitle}
        </CardTitle>
        <CardDescription>
          {step === 1 && 'Uw persoonlijke gegevens'}
          {step === 2 && 'Medische en leefstijl vragen'}
          {step === 3 && 'Akkoordverklaring en verzending'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <Form {...personalInfoForm}>
            <form
              onSubmit={personalInfoForm.handleSubmit(handleNextStep)}
              className="space-y-6"
            >
              <FormField
                control={personalInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volledige naam</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan Jansen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input placeholder="email@voorbeeld.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="0612345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="bsn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Burgerservicenummer (BSN)</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormDescription>
                      Dit is nodig om de zorg te declareren bij uw basisverzekering.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="insurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zorgverzekeraar</FormLabel>
                    <FormControl>
                      <Input placeholder="Naam van uw zorgverzekeraar" {...field} />
                    </FormControl>
                     <FormDescription>
                      Nodig voor de administratieve afhandeling en vergoeding.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personalInfoForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input placeholder="Straatnaam 1, 1234 AB Plaats" {...field} />
                    </FormControl>
                     <FormDescription>
                      Wordt gebruikt voor de administratie van de zorgverlener.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Volgende stap</Button>
            </form>
          </Form>
        )}

        {step === 2 && (
          <Form {...dietIntakeForm}>
            <form
              onSubmit={dietIntakeForm.handleSubmit(handleNextStep)}
              className="space-y-8"
            >
              {/* Reden van aanmelding */}
              <FormField
                control={dietIntakeForm.control}
                name="reason"
                render={() => (
                    <FormItem>
                        <FormLabel>1. Waarom komt u bij de diëtist?</FormLabel>
                        {['Gewicht verminderen', 'Gezondere leefstijl', 'Advies rondom voeding en artrose', 'Ondersteuning bij bewegen of training'].map((item) => (
                            <FormField
                            key={item}
                            control={dietIntakeForm.control}
                            name="reason"
                            render={({ field }) => {
                                return (
                                <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, item])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== item
                                                )
                                            )
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {item}
                                    </FormLabel>
                                </FormItem>
                                )
                            }}
                            />
                        ))}
                        <FormMessage />
                    </FormItem>
                )}
              />

              {/* Gewicht & leefstijl */}
               <Card className="p-4 bg-secondary/30">
                  <CardHeader className="p-2">
                    <CardTitle className="text-lg">2. Gewicht & Leefstijl</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={dietIntakeForm.control} name="height" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lengte (in cm)</FormLabel>
                            <FormControl><Input {...field} type="number" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                        <FormField control={dietIntakeForm.control} name="weight" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gewicht (in kg)</FormLabel>
                            <FormControl><Input {...field} type="number" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                      </div>
                      {calculateBmi(dietIntakeForm.watch('height'), dietIntakeForm.watch('weight')) && (
                          <p className="text-sm font-medium">Uw BMI is: <span className="text-primary">{calculateBmi(dietIntakeForm.watch('height'), dietIntakeForm.watch('weight'))}</span></p>
                      )}

                      <FormField control={dietIntakeForm.control} name="weightChange" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is uw gewicht het afgelopen jaar veranderd?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="toegenomen" /></FormControl><FormLabel className="font-normal">Ja, toegenomen</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="afgenomen" /></FormControl><FormLabel className="font-normal">Ja, afgenomen</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="nee" /></FormControl><FormLabel className="font-normal">Nee</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="weet niet" /></FormControl><FormLabel className="font-normal">Weet ik niet</FormLabel></FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </CardContent>
               </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={handlePreviousStep}>Vorige stap</Button>
                <Button type="submit">Volgende stap</Button>
              </div>
            </form>
          </Form>
        )}
        
        {step === 3 && (
            <div>
              <CardTitle className="mb-4 font-headline text-xl">Akkoordverklaring</CardTitle>
              <p className="text-muted-foreground mb-4">Lees de voorwaarden zorgvuldig door. Door akkoord te gaan, geeft u toestemming om uw gegevens te delen met de zorgverlener.</p>
              <div className="max-h-48 overflow-y-auto border p-4 rounded-md mb-6 bg-secondary/30">
                <TermsAndConditions />
              </div>
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox id="terms-agree" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(checked as boolean)} />
                <label
                  htmlFor="terms-agree"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ik ga akkoord met de algemene voorwaarden.
                </label>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>Vorige stap</Button>
                <Button onClick={handleFinalSubmit} disabled={!termsAgreed}>Verstuur Intakeformulier</Button>
              </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntakeForm;

    
    